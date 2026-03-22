import { createAdminClient } from "@/app/lib/supabase-admin";
import MembersShell from "./MembersShell";

async function getEvents() {
  const db = createAdminClient();
  const { data } = await db
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });
  return data ?? [];
}

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const events = await getEvents();
  return <MembersShell events={events} />;
}
