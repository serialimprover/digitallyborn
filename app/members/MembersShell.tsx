"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const RESOURCES = [
  { tag: "Guide", tagClass: "tag-guide", title: "PLM Migration Playbook: Lessons from 14 Manufacturing CIOs", desc: "A candid compilation of what worked, what didn't, and what everyone wishes they'd known before migrating product lifecycle management systems.", meta: "PDF · 28 pages", date: "Updated Mar 2026" },
  { tag: "Recording", tagClass: "tag-recording", title: "Roundtable: ERP Consolidation in Multi-Site Manufacturing", desc: "Six members share their experiences consolidating disparate ERP instances — including two who rolled back mid-project.", meta: "Video · 62 min", date: "Feb 2026" },
  { tag: "Template", tagClass: "tag-template", title: "Vendor Evaluation Scorecard for Manufacturing Software", desc: "A peer-tested scoring framework for evaluating PLM, MES, QMS, and ERP vendors without the usual analyst bias.", meta: "Spreadsheet", date: "Jan 2026" },
  { tag: "Report", tagClass: "tag-report", title: "2025 Member Survey: State of Digital in Hardware Companies", desc: "Anonymous aggregate data from 92 member responses on budgets, team sizes, platform choices, and transformation timelines.", meta: "PDF · 44 pages", date: "Dec 2025" },
  { tag: "Recording", tagClass: "tag-recording", title: "AMA: Building a Digital Thread Without Burning Out Your Team", desc: "A candid ask-me-anything session with a VP of Engineering Systems who connected PLM to MES across three plants.", meta: "Video · 48 min", date: "Nov 2025" },
  { tag: "Guide", tagClass: "tag-guide", title: "Negotiating Enterprise Software Contracts: What Actually Works", desc: "Crowd-sourced negotiation tactics from members who've signed 7- and 8-figure deals with major platform vendors.", meta: "PDF · 16 pages", date: "Oct 2025" },
];

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

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00"); // noon to avoid timezone flips
  return {
    month: MONTH_NAMES[d.getMonth()],
    day: String(d.getDate()),
  };
}

export default function MembersShell({ events }: Props) {
  const [tab, setTab] = useState<"resources" | "events">("resources");
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="members-page">
      <div className="members-header">
        <div>
          <h1>Member Hub</h1>
          <p>Resources, events, and community — exclusively for Digitally Born members.</p>
        </div>
        <button onClick={handleSignOut} className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "8px 18px" }}>
          Sign out
        </button>
        <div className="tab-bar">
          <button className={`tab ${tab === "resources" ? "active" : ""}`} onClick={() => setTab("resources")}>
            Resources
          </button>
          <button className={`tab ${tab === "events" ? "active" : ""}`} onClick={() => setTab("events")}>
            Events {events.length > 0 && <span className="tab-count">{events.length}</span>}
          </button>
        </div>
      </div>

      {/* Slack community banner — always visible */}
      <a
        href="https://join.slack.com/t/digitally-born/shared_invite/zt-2pm385fxh-owGCHEvZocCjWpLGgWIGdw"
        target="_blank"
        rel="noopener noreferrer"
        className="slack-banner"
      >
        <div className="slack-banner-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
          </svg>
        </div>
        <div className="slack-banner-text">
          <div className="slack-banner-title">Join the conversation on Slack</div>
          <div className="slack-banner-sub">Ask questions, share insights, and connect with fellow members between events</div>
        </div>
        <div className="slack-banner-arrow">→</div>
      </a>

      {tab === "resources" && (
        <div className="resources-grid">
          {RESOURCES.map((r, i) => (
            <div key={i} className="resource-card">
              <span className={`resource-tag ${r.tagClass}`}>{r.tag}</span>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
              <div className="resource-meta">
                <span>{r.meta}</span>
                <span>{r.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "events" && (
        <div className="events-list">
          {events.length === 0 && (
            <div className="events-empty">
              <p>No upcoming events scheduled. Check back soon.</p>
            </div>
          )}
          {events.map((ev) => {
            const { month, day } = formatEventDate(ev.event_date);
            const meta = [ev.event_time, ev.location].filter(Boolean).join(" · ");
            return (
              <div key={ev.id} className={`event-row ${ev.link ? "event-row-linked" : ""}`}>
                <div className="event-date">
                  <div className="event-month">{month}</div>
                  <div className="event-day">{day}</div>
                </div>
                <div className="event-info">
                  <h3>{ev.title}</h3>
                  {(ev.description || meta) && (
                    <p>{[meta, ev.description].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span className="event-type">{ev.type}</span>
                  {ev.link && (
                    <a href={ev.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: "6px 16px", fontSize: "0.78rem" }}>
                      RSVP →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
