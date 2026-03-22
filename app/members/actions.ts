"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { createAdminClient } from "@/app/lib/supabase-admin";

async function getSessionEmail() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Unauthorized");
  return user.email;
}

export async function rsvpToEvent(eventId: string) {
  const email = await getSessionEmail();
  const db = createAdminClient();
  const { error } = await db
    .from("event_rsvps")
    .upsert({ event_id: eventId, member_email: email }, { onConflict: "event_id,member_email" });
  if (error) throw error;
  revalidatePath("/members");
}

export async function cancelRsvp(eventId: string) {
  const email = await getSessionEmail();
  const db = createAdminClient();
  const { error } = await db
    .from("event_rsvps")
    .delete()
    .eq("event_id", eventId)
    .eq("member_email", email);
  if (error) throw error;
  revalidatePath("/members");
}
