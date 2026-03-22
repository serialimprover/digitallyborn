"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

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

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function CalendarView({ events }: { events: Event[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selected, setSelected] = useState<Event | null>(null);

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate: Record<string, Event[]> = {};
  for (const ev of events) {
    const d = new Date(ev.event_date + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate().toString();
      if (!eventsByDate[key]) eventsByDate[key] = [];
      eventsByDate[key].push(ev);
    }
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelected(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  const todayKey = today.getFullYear() === year && today.getMonth() === month
    ? today.getDate().toString()
    : null;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="calendar-wrap">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={prevMonth}>‹</button>
        <span className="calendar-title">{MONTH_NAMES[month]} {year}</span>
        <button className="calendar-nav" onClick={nextMonth}>›</button>
      </div>

      <div className="calendar-grid">
        {DAY_NAMES.map(d => (
          <div key={d} className="calendar-day-name">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="calendar-cell calendar-cell-empty" />;
          const dayEvents = eventsByDate[day.toString()] ?? [];
          const isToday = todayKey === day.toString();
          return (
            <div
              key={day}
              className={`calendar-cell${isToday ? " calendar-cell-today" : ""}${dayEvents.length ? " calendar-cell-has-events" : ""}`}
            >
              <div className="calendar-cell-num">{day}</div>
              {dayEvents.map(ev => (
                <button
                  key={ev.id}
                  className="calendar-event-pill"
                  onClick={() => setSelected(selected?.id === ev.id ? null : ev)}
                >
                  {ev.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="calendar-detail">
          <div className="calendar-detail-header">
            <div>
              <h3>{selected.title}</h3>
              <span className="event-type">{selected.type}</span>
            </div>
            <button className="calendar-detail-close" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div className="calendar-detail-meta">
            {(() => {
              const d = new Date(selected.event_date + "T12:00:00");
              return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
            })()}
            {selected.event_time && ` · ${selected.event_time}`}
            {selected.location && ` · ${selected.location}`}
          </div>
          {selected.description && <p className="calendar-detail-desc">{selected.description}</p>}
          {selected.link && (
            <a href={selected.link} target="_blank" rel="noopener noreferrer" className="btn btn-accent" style={{ fontSize: "0.82rem", padding: "8px 20px" }}>
              RSVP →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function MembersShell({ events }: Props) {
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
          <p>Events and community — exclusively for Digitally Born members.</p>
        </div>
        <button onClick={handleSignOut} className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "8px 18px" }}>
          Sign out
        </button>
      </div>

      {/* Slack community banner */}
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

      <CalendarView events={events} />
    </div>
  );
}
