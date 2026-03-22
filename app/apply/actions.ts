"use server";

import { createAdminClient } from "@/app/lib/supabase-admin";
import { sendNewApplicationEmail } from "@/app/lib/email";

export async function submitApplication(formData: {
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
}) {
  const db = createAdminClient();

  const { data, error } = await db
    .from("applications")
    .insert({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      linkedin: formData.linkedin || null,
      job_title: formData.job_title,
      company: formData.company,
      industry: formData.industry,
      company_size: formData.company_size,
      challenge: formData.challenge,
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
