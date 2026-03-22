import { createAdminClient } from "@/app/lib/supabase-admin";
import MembersClient from "./MembersClient";

// Strip characters that could manipulate the PostgREST filter expression.
function sanitizeQuery(q: string): string {
  return q.replace(/[(),%\\]/g, "").trim().slice(0, 200);
}

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
    const safe = sanitizeQuery(query);
    req = req.or(
      `first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%,company.ilike.%${safe}%`
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
