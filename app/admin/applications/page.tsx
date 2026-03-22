import Link from "next/link";
import { createAdminClient } from "@/app/lib/supabase-admin";

type Status = "pending" | "approved" | "rejected" | "all";

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

// Strip characters that could manipulate the PostgREST filter expression.
function sanitizeQuery(q: string): string {
  return q.replace(/[(),%\\]/g, "").trim().slice(0, 200);
}

async function getApplications(status: Status, query: string) {
  const db = createAdminClient();
  let req = db
    .from("applications")
    .select("id, first_name, last_name, email, company, job_title, industry, company_size, status, created_at, admin_notes")
    .order("created_at", { ascending: false });

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

export default async function ApplicationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = (params.status as Status) || "pending";
  const query = params.q ?? "";

  const applications = await getApplications(status, query);

  const tabs: { value: Status; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Applications</h1>
        <p className="admin-page-subtitle">{applications.length} result{applications.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-tab-bar">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/applications?status=${tab.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`admin-tab ${status === tab.value ? "active" : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <form method="GET" action="/admin/applications" className="admin-search-form">
          <input type="hidden" name="status" value={status} />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search by name, email, company…"
            className="form-input admin-search-input"
          />
          <button type="submit" className="btn btn-ghost" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
            Search
          </button>
        </form>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Company</th>
              <th>Industry</th>
              <th>Size</th>
              <th>Submitted</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-table-empty">
                  No applications found
                </td>
              </tr>
            )}
            {applications.map((app) => (
              <tr key={app.id}>
                <td>
                  <div className="admin-table-name">{app.first_name} {app.last_name}</div>
                  <div className="admin-table-secondary">{app.email}</div>
                </td>
                <td>
                  <div>{app.company}</div>
                  <div className="admin-table-secondary">{app.job_title}</div>
                </td>
                <td className="admin-table-secondary">{app.industry}</td>
                <td className="admin-table-secondary">{app.company_size}</td>
                <td className="admin-table-secondary">
                  {app.created_at
                    ? new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </td>
                <td>
                  <span className={`admin-badge admin-badge-${app.status}`}>{app.status}</span>
                </td>
                <td>
                  <Link href={`/admin/applications/${app.id}`} className="admin-table-action">
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
