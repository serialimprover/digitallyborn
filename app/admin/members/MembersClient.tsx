"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { suspendMember, cancelMember, reinstateMember, editMember } from "@/app/admin/actions";

interface Member {
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  job_title: string | null;
  status: string;
  joined_at: string | null;
  suspension_reason: string | null;
}

interface Props {
  members: Member[];
  status: string;
  query: string;
}

const STATUS_TABS = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

function MemberRow({ member, onAction }: { member: Member; onAction: (action: string, email: string, extra?: string) => void }) {
  const joinedDate = member.joined_at
    ? new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <tr>
      <td>
        <div className="admin-table-name">
          {member.first_name ?? ""} {member.last_name ?? ""}
        </div>
        <div className="admin-table-secondary">{member.email}</div>
      </td>
      <td>
        <div>{member.company ?? "—"}</div>
        <div className="admin-table-secondary">{member.job_title ?? "—"}</div>
      </td>
      <td className="admin-table-secondary">{joinedDate}</td>
      <td>
        <span className={`admin-badge admin-badge-${member.status}`}>{member.status}</span>
        {member.suspension_reason && (
          <div className="admin-table-secondary" style={{ marginTop: 4, maxWidth: 200 }}>
            {member.suspension_reason}
          </div>
        )}
      </td>
      <td>
        <div className="admin-member-actions">
          <button
            onClick={() => onAction("edit", member.email)}
            className="admin-table-action"
          >
            Edit
          </button>
          {member.status === "active" && (
            <>
              <button onClick={() => onAction("suspend", member.email)} className="admin-table-action">
                Suspend
              </button>
              <button onClick={() => onAction("cancel", member.email)} className="admin-table-action admin-table-action-danger">
                Cancel
              </button>
            </>
          )}
          {(member.status === "suspended" || member.status === "cancelled") && (
            <button onClick={() => onAction("reinstate", member.email)} className="admin-table-action">
              Reinstate
            </button>
          )}
          <a href={`mailto:${member.email}`} className="admin-table-action">
            Email
          </a>
        </div>
      </td>
    </tr>
  );
}

export default function MembersClient({ members, status, query }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Suspend modal
  const [suspendModal, setSuspendModal] = useState<{ email: string } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  // Edit modal
  const [editModal, setEditModal] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", company: "", job_title: "" });

  const handleAction = (action: string, email: string) => {
    if (action === "suspend") {
      setSuspendReason("");
      setSuspendModal({ email });
      return;
    }
    if (action === "edit") {
      const m = members.find((m) => m.email === email)!;
      setEditForm({
        first_name: m.first_name ?? "",
        last_name: m.last_name ?? "",
        company: m.company ?? "",
        job_title: m.job_title ?? "",
      });
      setEditModal(m);
      return;
    }

    startTransition(async () => {
      try {
        if (action === "cancel") {
          await cancelMember(email);
          setFeedback({ type: "success", message: "Member cancelled." });
        } else if (action === "reinstate") {
          await reinstateMember(email);
          setFeedback({ type: "success", message: "Member reinstated as active." });
        }
        router.refresh();
      } catch {
        setFeedback({ type: "error", message: "Action failed. Please try again." });
      }
    });
  };

  const handleSuspend = () => {
    if (!suspendModal) return;
    startTransition(async () => {
      try {
        await suspendMember(suspendModal.email, suspendReason);
        setSuspendModal(null);
        setFeedback({ type: "success", message: "Member suspended." });
        router.refresh();
      } catch {
        setFeedback({ type: "error", message: "Failed to suspend member." });
      }
    });
  };

  const handleEdit = () => {
    if (!editModal) return;
    startTransition(async () => {
      try {
        await editMember(editModal.email, editForm);
        setEditModal(null);
        setFeedback({ type: "success", message: "Member updated." });
        router.refresh();
      } catch {
        setFeedback({ type: "error", message: "Failed to update member." });
      }
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Members</h1>
        <p className="admin-page-subtitle">{members.length} result{members.length !== 1 ? "s" : ""}</p>
      </div>

      {feedback && (
        <div className={`admin-feedback admin-feedback-${feedback.type}`} style={{ marginBottom: 20 }}>
          {feedback.message}
          <button onClick={() => setFeedback(null)} className="admin-feedback-close">×</button>
        </div>
      )}

      <div className="admin-filters">
        <div className="admin-tab-bar">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/members?status=${tab.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`admin-tab ${status === tab.value ? "active" : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <form method="GET" action="/admin/members" className="admin-search-form">
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
              <th>Member</th>
              <th>Company</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">No members found</td>
              </tr>
            )}
            {members.map((m) => (
              <MemberRow key={m.email} member={m} onAction={handleAction} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Suspend modal */}
      {suspendModal && (
        <div className="admin-modal-overlay" onClick={() => setSuspendModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Suspend member</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: 16 }}>
              This will prevent <strong style={{ color: "var(--text-primary)" }}>{suspendModal.email}</strong> from signing in.
            </p>
            <div className="form-group">
              <label className="form-label">Reason (required)</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="form-input textarea"
                placeholder="Reason for suspension…"
                rows={3}
                autoFocus
                required
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={handleSuspend}
                disabled={isPending || !suspendReason.trim()}
                className="btn admin-btn-reject"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {isPending ? "Suspending…" : "Suspend"}
              </button>
              <button onClick={() => setSuspendModal(null)} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModal && (
        <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Edit member</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: 16 }}>{editModal.email}</p>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">First name</label>
                <input
                  className="form-input"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input
                  className="form-input"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input
                className="form-input"
                value={editForm.company}
                onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Job title</label>
              <input
                className="form-input"
                value={editForm.job_title}
                onChange={(e) => setEditForm((f) => ({ ...f, job_title: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={handleEdit}
                disabled={isPending}
                className="btn btn-accent"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {isPending ? "Saving…" : "Save changes"}
              </button>
              <button onClick={() => setEditModal(null)} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
