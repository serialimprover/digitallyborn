import { createAdminClient } from "@/app/lib/supabase-admin";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import MembersShell from "./MembersShell";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const db = createAdminClient();
  const supabase = await createSupabaseServerClient();

  const [{ data: events }, { data: { user } }] = await Promise.all([
    db.from("events").select("*").order("event_date", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  const { data: rsvps } = user?.email
    ? await db.from("event_rsvps").select("event_id").eq("member_email", user.email)
    : { data: [] };

  const rsvpedIds = new Set((rsvps ?? []).map((r) => r.event_id));

  return (
    <MembersShell
      events={events ?? []}
      rsvpedEventIds={rsvpedIds}
    />
  );
}
