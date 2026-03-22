"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/app/lib/supabase-admin";
import { sendNewApplicationEmail } from "@/app/lib/email";

// ── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory: max 5 submissions per IP per hour.
// Per-serverless-instance, so not globally shared on Vercel — but still stops
// simple scripted abuse and casual spam.
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 3_600_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

// ── Input validation ──────────────────────────────────────────────────────────

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  linkedin: string;
  job_title: string;
  company: string;
  industry: string;
  company_size: string;
  challenge: string;
  hopes: string;
  referral_source: string;
}

function validate(f: FormData): string | null {
  if (!f.first_name?.trim() || f.first_name.length > 100)
    return "Invalid first name.";
  if (!f.last_name?.trim() || f.last_name.length > 100)
    return "Invalid last name.";
  if (!f.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || f.email.length > 254)
    return "Invalid email address.";
  if (f.linkedin && f.linkedin.length > 500)
    return "LinkedIn URL is too long.";
  if (!f.job_title?.trim() || f.job_title.length > 200)
    return "Invalid job title.";
  if (!f.company?.trim() || f.company.length > 200)
    return "Invalid company name.";
  if (!f.challenge?.trim() || f.challenge.length > 5000)
    return "Challenge response is too long.";
  if (f.hopes && f.hopes.length > 5000)
    return "Hopes response is too long.";
  if (f.referral_source && f.referral_source.length > 500)
    return "Referral source is too long.";
  return null;
}

// ── Action ────────────────────────────────────────────────────────────────────

export async function submitApplication(formData: FormData) {
  // Rate limit by IP
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    throw new Error("Too many submissions. Please try again later.");
  }

  // Validate inputs
  const validationError = validate(formData);
  if (validationError) throw new Error(validationError);

  const db = createAdminClient();

  const { data, error } = await db
    .from("applications")
    .insert({
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.toLowerCase().trim(),
      linkedin: formData.linkedin || null,
      job_title: formData.job_title.trim(),
      company: formData.company.trim(),
      industry: formData.industry,
      company_size: formData.company_size,
      challenge: formData.challenge.trim(),
      hopes: formData.hopes || null,
      referral_source: formData.referral_source || null,
    })
    .select("id")
    .single();

  if (error) throw new Error("Failed to submit application");

  // Notify all admins — fire and forget, don't block the response
  const { data: admins } = await db.from("admins").select("email");
  const adminEmails = admins?.map((a) => a.email) ?? [];

  sendNewApplicationEmail(formData, adminEmails, data?.id).catch((err) =>
    console.error("Failed to send new application email:", err)
  );
}
