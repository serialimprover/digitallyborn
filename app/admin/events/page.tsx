import { createAdminClient } from "@/app/lib/supabase-admin";
import EventsClient from "./EventsClient";

async function getEventsWithRsvpCounts() {
  const db = createAdminClient();
  const { data: events } = await db
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  const { data: rsvps } = await db
    .from("event_rsvps")
    .select("event_id");

  const counts: Record<string, number> = {};
  for (const r of rsvps ?? []) {
    counts[r.event_id] = (counts[r.event_id] ?? 0) + 1;
  }

  return (events ?? []).map((ev) => ({ ...ev, rsvp_count: counts[ev.id] ?? 0 }));
}

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await getEventsWithRsvpCounts();
  return <EventsClient events={events} />;
}
