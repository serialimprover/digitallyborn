import { createAdminClient } from "@/app/lib/supabase-admin";
import EventsClient from "./EventsClient";

async function getEvents() {
  const db = createAdminClient();
  const { data } = await db
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });
  return data ?? [];
}

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await getEvents();
  return <EventsClient events={events} />;
}
