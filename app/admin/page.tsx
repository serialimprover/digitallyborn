import Link from "next/link";
import { createAdminClient } from "@/app/lib/supabase-admin";

async function getStats() {
  const db = createAdminClient();

  const [pendingRes, approvedRes, rejectedRes, membersRes] = await Promise.all([
    db.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("applications").select("id", { count: "exact", head: true }).eq("status", "approved"),
    db.from("applications").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    db.from("approved_members").select("email", { count: "exact", head: true }).eq("status", "active"),
  ]);

  return {
    pending: pendingRes.count ?? 0,
    approved: approvedRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
    activeMembers: membersRes.count ?? 0,
  };
}

async function getRecentApplications() {
  const db = createAdminClient();
  const { data } = await db
    .from("applications")
    .select("id, first_name, last_name, company, job_title, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getStats(), getRecentApplications()]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Overview of applications and membership</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.pending}</div>
          <div className="admin-stat-label">Pending review</div>
          <Link href="/admin/applications?status=pending" className="admin-stat-link">View all →</Link>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.activeMembers}</div>
          <div className="admin-stat-label">Active members</div>
          <Link href="/admin/members" className="admin-stat-link">View all →</Link>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.approved}</div>
          <div className="admin-stat-label">Total approved</div>
          <Link href="/admin/applications?status=approved" className="admin-stat-link">View all →</Link>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.rejected}</div>
          <div className="admin-stat-label">Rejected</div>
          <Link href="/admin/applications?status=rejected" className="admin-stat-link">View all →</Link>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Recent applications</h2>
          <Link href="/admin/applications" className="admin-section-link">View all</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Role</th>
                <th>Submitted</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-table-empty">No applications yet</td>
                </tr>
              )}
              {recent.map((app) => (
                <tr key={app.id}>
                  <td className="admin-table-name">{app.first_name} {app.last_name}</td>
                  <td>{app.company}</td>
                  <td className="admin-table-secondary">{app.job_title}</td>
                  <td className="admin-table-secondary">
                    {app.created_at
                      ? new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td><span className={`admin-badge admin-badge-${app.status}`}>{app.status}</span></td>
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
    </div>
  );
}
