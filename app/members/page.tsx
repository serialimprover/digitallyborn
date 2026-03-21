"use client";

import { useState } from "react";

const RESOURCES = [
  { tag: "Guide", tagClass: "tag-guide", title: "PLM Migration Playbook: Lessons from 14 Manufacturing CIOs", desc: "A candid compilation of what worked, what didn't, and what everyone wishes they'd known before migrating product lifecycle management systems.", meta: "PDF · 28 pages", date: "Updated Mar 2026" },
  { tag: "Recording", tagClass: "tag-recording", title: "Roundtable: ERP Consolidation in Multi-Site Manufacturing", desc: "Six members share their experiences consolidating disparate ERP instances — including two who rolled back mid-project.", meta: "Video · 62 min", date: "Feb 2026" },
  { tag: "Template", tagClass: "tag-template", title: "Vendor Evaluation Scorecard for Manufacturing Software", desc: "A peer-tested scoring framework for evaluating PLM, MES, QMS, and ERP vendors without the usual analyst bias.", meta: "Spreadsheet", date: "Jan 2026" },
  { tag: "Report", tagClass: "tag-report", title: "2025 Member Survey: State of Digital in Hardware Companies", desc: "Anonymous aggregate data from 92 member responses on budgets, team sizes, platform choices, and transformation timelines.", meta: "PDF · 44 pages", date: "Dec 2025" },
  { tag: "Recording", tagClass: "tag-recording", title: "AMA: Building a Digital Thread Without Burning Out Your Team", desc: "A candid ask-me-anything session with a VP of Engineering Systems who connected PLM to MES across three plants.", meta: "Video · 48 min", date: "Nov 2025" },
  { tag: "Guide", tagClass: "tag-guide", title: "Negotiating Enterprise Software Contracts: What Actually Works", desc: "Crowd-sourced negotiation tactics from members who've signed 7- and 8-figure deals with major platform vendors.", meta: "PDF · 16 pages", date: "Oct 2025" },
];

const EVENTS = [
  { month: "APR", day: "8", title: "Virtual Roundtable: MES — Build, Buy, or Bolt-On?", desc: "12:00 PM ET · 60 minutes · Open discussion on manufacturing execution system strategy", type: "Roundtable" },
  { month: "APR", day: "22", title: "Peer Review: Siemens Xcelerator vs. PTC Windchill (Honest Takes)", desc: "1:00 PM ET · 90 minutes · Members who've used both share side-by-side experiences", type: "Peer Review" },
  { month: "MAY", day: "6", title: "In-Person Dinner: Chicago — Digital Leaders in Manufacturing", desc: "6:30 PM CT · Intimate dinner for 20 members · RSVP required", type: "Dinner" },
  { month: "MAY", day: "20", title: "AMA: How I Sold the Board on a $12M Digital Transformation", desc: "12:00 PM ET · 60 minutes · A member CIO shares their pitch deck and boardroom strategy", type: "AMA" },
  { month: "JUN", day: "10", title: "Workshop: Building a Business Case for IoT on the Shop Floor", desc: "11:00 AM ET · 2 hours · Hands-on session with templates and peer feedback", type: "Workshop" },
];

export default function MembersPage() {
  const [tab, setTab] = useState<"resources" | "events">("resources");

  return (
    <div className="members-page">
      <div className="members-header">
        <div>
          <h1>Member Hub</h1>
          <p>Resources, recordings, and upcoming events — exclusively for Digitally Born members.</p>
        </div>
        <div className="tab-bar">
          <button className={`tab ${tab === "resources" ? "active" : ""}`} onClick={() => setTab("resources")}>
            Resources
          </button>
          <button className={`tab ${tab === "events" ? "active" : ""}`} onClick={() => setTab("events")}>
            Events
          </button>
        </div>
      </div>

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
          {EVENTS.map((ev, i) => (
            <div key={i} className="event-row">
              <div className="event-date">
                <div className="event-month">{ev.month}</div>
                <div className="event-day">{ev.day}</div>
              </div>
              <div className="event-info">
                <h3>{ev.title}</h3>
                <p>{ev.desc}</p>
              </div>
              <span className="event-type">{ev.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
