import { createAdminClient } from "@/app/lib/supabase-admin";
import MembersClient from "./MembersClient";

async function getMembers(status: string, query: string) {
  const db = createAdminClient();
  let req = db
    .from("approved_members")
    .select("email, first_name, last_name, company, job_title, status, joined_at, suspension_reason")
    .order("joined_at", { ascending: false });

  if (status !== "all") {
    req = req.eq("status", status);
  }

  if (query) {
    req = req.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`
    );
  }

  const { data } = await req;
  return data ?? [];
}

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function MembersPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = params.status ?? "active";
  const query = params.q ?? "";

  const members = await getMembers(status, query);

  return <MembersClient members={members} status={status} query={query} />;
}
