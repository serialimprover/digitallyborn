"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/app/lib/supabase-admin";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendNewEventEmail,
} from "@/app/lib/email";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Unauthorized");

  const adminClient = createAdminClient();
  const { data: admin } = await adminClient
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .single();

  if (!admin) throw new Error("Unauthorized");
  return adminClient;
}

// ── Applications ────────────────────────────────────────────────────────────

export async function approveApplication(id: string) {
  const db = await requireAdmin();

  // Fetch application details
  const { data: app, error: fetchError } = await db
    .from("applications")
    .select("email, first_name, last_name, company, job_title")
    .eq("id", id)
    .single();

  if (fetchError || !app) throw new Error("Application not found");

  // Mark application approved
  const { error: updateError } = await db
    .from("applications")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) throw updateError;

  // Add to approved_members (upsert so re-approving is safe)
  const { error: memberError } = await db
    .from("approved_members")
    .upsert({
      email: app.email,
      first_name: app.first_name,
      last_name: app.last_name,
      company: app.company,
      job_title: app.job_title,
      status: "active",
      joined_at: new Date().toISOString(),
    }, { onConflict: "email" });

  if (memberError) throw memberError;

  // Notify the applicant — fire and forget
  sendApprovalEmail(app.email, app.first_name).catch((err) =>
    console.error("Failed to send approval email:", err)
  );

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  revalidatePath("/admin/members");
  revalidatePath("/admin");
}

export async function rejectApplication(id: string, notes?: string) {
  const db = await requireAdmin();

  const { data: app } = await db
    .from("applications")
    .select("email, first_name")
    .eq("id", id)
    .single();

  const { error } = await db
    .from("applications")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      admin_notes: notes ?? null,
    })
    .eq("id", id);

  if (error) throw error;

  if (app) {
    sendRejectionEmail(app.email, app.first_name).catch((err) =>
      console.error("Failed to send rejection email:", err)
    );
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  revalidatePath("/admin");
}

export async function saveApplicationNotes(id: string, notes: string) {
  const db = await requireAdmin();

  const { error } = await db
    .from("applications")
    .update({ admin_notes: notes })
    .eq("id", id);

  if (error) throw error;

  revalidatePath(`/admin/applications/${id}`);
}

// ── Members ──────────────────────────────────────────────────────────────────

export async function suspendMember(email: string, reason: string) {
  const db = await requireAdmin();

  const { error } = await db
    .from("approved_members")
    .update({
      status: "suspended",
      suspension_reason: reason,
    })
    .eq("email", email);

  if (error) throw error;

  revalidatePath("/admin/members");
  revalidatePath("/admin");
}

export async function cancelMember(email: string) {
  const db = await requireAdmin();

  const { error } = await db
    .from("approved_members")
    .update({ status: "cancelled", suspension_reason: null })
    .eq("email", email);

  if (error) throw error;

  revalidatePath("/admin/members");
  revalidatePath("/admin");
}

export async function reinstateMember(email: string) {
  const db = await requireAdmin();

  const { error } = await db
    .from("approved_members")
    .update({ status: "active", suspension_reason: null })
    .eq("email", email);

  if (error) throw error;

  revalidatePath("/admin/members");
  revalidatePath("/admin");
}

export async function editMember(
  email: string,
  data: {
    first_name?: string;
    last_name?: string;
    company?: string;
    job_title?: string;
  }
) {
  const db = await requireAdmin();

  const { error } = await db
    .from("approved_members")
    .update(data)
    .eq("email", email);

  if (error) throw error;

  revalidatePath("/admin/members");
}

// ── Events ───────────────────────────────────────────────────────────────────

export interface EventData {
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  type: string;
  location?: string;
  link?: string;
}

export async function createEvent(data: EventData) {
  const db = await requireAdmin();

  const { error } = await db.from("events").insert({
    title: data.title,
    description: data.description || null,
    event_date: data.event_date,
    event_time: data.event_time || null,
    type: data.type,
    location: data.location || null,
    link: data.link || null,
  });

  if (error) throw error;

  // Email all active members — fire and forget
  db.from("approved_members")
    .select("email")
    .eq("status", "active")
    .then(({ data: members }) => {
      const emails = members?.map((m) => m.email) ?? [];
      sendNewEventEmail(data, emails).catch((err) =>
        console.error("Failed to send new event emails:", err)
      );
    });

  revalidatePath("/admin/events");
  revalidatePath("/members");
}

export async function updateEvent(id: string, data: EventData) {
  const db = await requireAdmin();

  const { error } = await db.from("events").update({
    title: data.title,
    description: data.description || null,
    event_date: data.event_date,
    event_time: data.event_time || null,
    type: data.type,
    location: data.location || null,
    link: data.link || null,
  }).eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/events");
  revalidatePath("/members");
}

export async function deleteEvent(id: string) {
  const db = await requireAdmin();

  const { error } = await db.from("events").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/events");
  revalidatePath("/members");
}
