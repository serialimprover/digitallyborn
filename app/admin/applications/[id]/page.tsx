import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/app/lib/supabase-admin";
import ApplicationActions from "./ApplicationActions";

interface Props {
  params: Promise<{ id: string }>;
}

async function getApplication(id: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="admin-detail-field">
      <div className="admin-detail-label">{label}</div>
      <div className="admin-detail-value">{value || <span style={{ color: "var(--text-tertiary)" }}>—</span>}</div>
    </div>
  );
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const app = await getApplication(id);

  if (!app) notFound();

  const submittedDate = app.created_at
    ? new Date(app.created_at).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : "Unknown";

  const reviewedDate = app.reviewed_at
    ? new Date(app.reviewed_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/applications" className="admin-back-link">← Applications</Link>
          <h1 className="admin-page-title" style={{ marginTop: 8 }}>
            {app.first_name} {app.last_name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <span className={`admin-badge admin-badge-${app.status}`}>{app.status}</span>
            <span className="admin-table-secondary">Submitted {submittedDate}</span>
            {reviewedDate && (
              <span className="admin-table-secondary">· Reviewed {reviewedDate}</span>
            )}
          </div>
        </div>
      </div>

      <div className="admin-detail-grid">
        {/* Left column — applicant details */}
        <div className="admin-detail-col">
          <div className="admin-card">
            <div className="admin-card-title">Contact</div>
            <Field label="Email" value={app.email} />
            {app.linkedin && (
              <Field label="LinkedIn" value={app.linkedin} />
            )}
          </div>

          <div className="admin-card">
            <div className="admin-card-title">Role</div>
            <Field label="Job title" value={app.job_title} />
            <Field label="Company" value={app.company} />
            <Field label="Industry" value={app.industry} />
            <Field label="Company size" value={app.company_size} />
          </div>

          <div className="admin-card">
            <div className="admin-card-title">Interest</div>
            <Field label="Biggest challenge" value={app.challenge} />
            <Field label="Hopes from community" value={app.hopes} />
            <Field label="Referral source" value={app.referral_source} />
          </div>
        </div>

        {/* Right column — actions */}
        <div className="admin-detail-col">
          <ApplicationActions
            id={app.id}
            status={app.status}
            initialNotes={app.admin_notes ?? ""}
            applicantName={`${app.first_name} ${app.last_name}`}
            applicantEmail={app.email}
          />
        </div>
      </div>
    </div>
  );
}
