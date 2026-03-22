"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent, deleteEvent, EventData } from "@/app/admin/actions";

const EVENT_TYPES = ["Roundtable", "AMA", "Workshop", "Dinner", "Peer Review", "Webinar", "Other"];

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  type: string;
  location: string | null;
  link: string | null;
}

interface Props {
  events: Event[];
}

const MONTH_NAMES = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const EMPTY_FORM: EventData = {
  title: "",
  description: "",
  event_date: "",
  event_time: "",
  type: "Roundtable",
  location: "",
  link: "",
};

export default function EventsClient({ events }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventData>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Event | null>(null);

  const openCreate = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (ev: Event) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title,
      description: ev.description ?? "",
      event_date: ev.event_date,
      event_time: ev.event_time ?? "",
      type: ev.type,
      location: ev.location ?? "",
      link: ev.link ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingEvent) {
          await updateEvent(editingEvent.id, form);
          setFeedback({ type: "success", message: "Event updated." });
        } else {
          await createEvent(form);
          setFeedback({ type: "success", message: "Event created." });
        }
        setShowModal(false);
        router.refresh();
      } catch {
        setFeedback({ type: "error", message: "Something went wrong. Please try again." });
      }
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      try {
        await deleteEvent(confirmDelete.id);
        setConfirmDelete(null);
        setFeedback({ type: "success", message: "Event deleted." });
        router.refresh();
      } catch {
        setFeedback({ type: "error", message: "Failed to delete event." });
      }
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter((e) => e.event_date >= today);
  const past = events.filter((e) => e.event_date < today);

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="admin-page-title">Events</h1>
          <p className="admin-page-subtitle">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button onClick={openCreate} className="btn btn-accent" style={{ fontSize: "0.85rem", padding: "10px 22px" }}>
          + Add event
        </button>
      </div>

      {feedback && (
        <div className={`admin-feedback admin-feedback-${feedback.type}`} style={{ marginBottom: 24 }}>
          {feedback.message}
          <button onClick={() => setFeedback(null)} className="admin-feedback-close">×</button>
        </div>
      )}

      {/* Upcoming */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Upcoming</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Type</th>
                <th>Time</th>
                <th>Location</th>
                <th>Link</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 && (
                <tr><td colSpan={7} className="admin-table-empty">No upcoming events — add one above</td></tr>
              )}
              {upcoming.map((ev) => (
                <tr key={ev.id}>
                  <td className="admin-table-name" style={{ whiteSpace: "nowrap" }}>{formatDate(ev.event_date)}</td>
                  <td>
                    <div className="admin-table-name">{ev.title}</div>
                    {ev.description && <div className="admin-table-secondary">{ev.description}</div>}
                  </td>
                  <td><span className="admin-badge admin-badge-pending">{ev.type}</span></td>
                  <td className="admin-table-secondary">{ev.event_time || "—"}</td>
                  <td className="admin-table-secondary">{ev.location || "—"}</td>
                  <td>
                    {ev.link
                      ? <a href={ev.link} target="_blank" rel="noopener noreferrer" className="admin-table-action">View →</a>
                      : <span className="admin-table-secondary">—</span>}
                  </td>
                  <td>
                    <div className="admin-member-actions">
                      <button onClick={() => openEdit(ev)} className="admin-table-action">Edit</button>
                      <button onClick={() => setConfirmDelete(ev)} className="admin-table-action admin-table-action-danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title" style={{ color: "var(--text-tertiary)" }}>Past</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {past.map((ev) => (
                  <tr key={ev.id} style={{ opacity: 0.6 }}>
                    <td className="admin-table-secondary" style={{ whiteSpace: "nowrap" }}>{formatDate(ev.event_date)}</td>
                    <td className="admin-table-name">{ev.title}</td>
                    <td><span className="admin-badge admin-badge-cancelled">{ev.type}</span></td>
                    <td>
                      <div className="admin-member-actions">
                        <button onClick={() => openEdit(ev)} className="admin-table-action">Edit</button>
                        <button onClick={() => setConfirmDelete(ev)} className="admin-table-action admin-table-action-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">{editingEvent ? "Edit event" : "Add event"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title <span className="required">*</span></label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input textarea"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date <span className="required">*</span></label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.event_date}
                    onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="12:00 PM ET"
                    value={form.event_time}
                    onChange={(e) => setForm((f) => ({ ...f, event_time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type <span className="required">*</span></label>
                  <select
                    className="form-input select"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    className="form-input"
                    placeholder="Virtual / City"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">RSVP / Registration link</label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://..."
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={isPending} className="btn btn-accent" style={{ flex: 1, justifyContent: "center" }}>
                  {isPending ? "Saving…" : editingEvent ? "Save changes" : "Create event"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Delete event?</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: 20 }}>
              <strong style={{ color: "var(--text-primary)" }}>{confirmDelete.title}</strong> on {formatDate(confirmDelete.event_date)} will be permanently removed and will no longer appear in the member hub.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDelete} disabled={isPending} className="btn admin-btn-reject" style={{ flex: 1, justifyContent: "center" }}>
                {isPending ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
