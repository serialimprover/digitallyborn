"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveApplication, rejectApplication, saveApplicationNotes } from "@/app/admin/actions";

interface Props {
  id: string;
  status: string;
  initialNotes: string;
  applicantName: string;
  applicantEmail: string;
}

export default function ApplicationActions({ id, status, initialNotes, applicantName, applicantEmail }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveApplication(id);
        setFeedback({ type: "success", message: `${applicantName} has been approved and added to the members list.` });
        router.refresh();
      } catch {
        setFeedback({ type: "error", message: "Failed to approve application. Please try again." });
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      try {
        await rejectApplication(id, rejectNotes || undefined);
        setShowRejectModal(false);
        setFeedback({ type: "success", message: "Application has been rejected." });
        router.refresh();
      } catch {
        setFeedback({ type: "error", message: "Failed to reject application. Please try again." });
      }
    });
  };

  const handleSaveNotes = () => {
    startTransition(async () => {
      try {
        await saveApplicationNotes(id, notes);
        setFeedback({ type: "success", message: "Notes saved." });
      } catch {
        setFeedback({ type: "error", message: "Failed to save notes." });
      }
    });
  };

  return (
    <>
      {/* Feedback banner */}
      {feedback && (
        <div className={`admin-feedback admin-feedback-${feedback.type}`}>
          {feedback.message}
          <button onClick={() => setFeedback(null)} className="admin-feedback-close">×</button>
        </div>
      )}

      {/* Decision panel */}
      <div className="admin-card">
        <div className="admin-card-title">Decision</div>

        {status === "pending" && (
          <div className="admin-action-buttons">
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="btn btn-accent"
              style={{ flex: 1, justifyContent: "center" }}
            >
              {isPending ? "Processing…" : "Approve application"}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isPending}
              className="btn btn-ghost admin-btn-reject"
              style={{ flex: 1, justifyContent: "center" }}
            >
              Reject
            </button>
          </div>
        )}

        {status === "approved" && (
          <div>
            <div className="admin-status-message admin-status-approved">
              ✓ Approved — {applicantName} is an active member
            </div>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isPending}
              className="btn btn-ghost admin-btn-reject"
              style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
            >
              Revoke approval
            </button>
          </div>
        )}

        {status === "rejected" && (
          <div>
            <div className="admin-status-message admin-status-rejected">
              ✗ Rejected
            </div>
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="btn btn-accent"
              style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
            >
              {isPending ? "Processing…" : "Approve instead"}
            </button>
          </div>
        )}
      </div>

      {/* Admin notes */}
      <div className="admin-card">
        <div className="admin-card-title">Admin notes</div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: 12 }}>
          Internal only — not visible to the applicant.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-input textarea"
          placeholder="Add notes about this application…"
          rows={5}
        />
        <button
          onClick={handleSaveNotes}
          disabled={isPending || notes === initialNotes}
          className="btn btn-ghost"
          style={{ marginTop: 10, padding: "8px 20px", fontSize: "0.82rem" }}
        >
          {isPending ? "Saving…" : "Save notes"}
        </button>
      </div>

      {/* Quick info */}
      <div className="admin-card">
        <div className="admin-card-title">Quick actions</div>
        <a
          href={`mailto:${applicantEmail}`}
          className="admin-quick-action"
        >
          <span>✉</span> Email applicant
        </a>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="admin-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">
              {status === "approved" ? "Revoke approval" : "Reject application"}
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: 16 }}>
              {status === "approved"
                ? `This will remove ${applicantName} from the active members list.`
                : `Rejecting ${applicantName}'s application. Add an optional internal note below.`}
            </p>
            <div className="form-group">
              <label className="form-label">Internal note (optional)</label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="form-input textarea"
                placeholder="Reason for rejection…"
                rows={3}
                autoFocus
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="btn admin-btn-reject"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {isPending ? "Processing…" : "Confirm"}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn btn-ghost"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
