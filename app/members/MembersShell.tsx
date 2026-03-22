"use client";

import { useState, useTransition } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { rsvpToEvent, cancelRsvp } from "./actions";

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
  rsvpedEventIds: Set<string>;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function IconChevLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function buildGoogleCalendarUrl(ev: Event) {
  const d = new Date(ev.event_date + "T12:00:00");
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const dates = `${dateStr}/${dateStr}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates,
    ...(ev.description ? { details: ev.description } : {}),
    ...(ev.location ? { location: ev.location } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function buildOutlookUrl(ev: Event) {
  const d = new Date(ev.event_date + "T12:00:00");
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const params = new URLSearchParams({
    subject: ev.title,
    startdt: dateStr,
    enddt: dateStr,
    ...(ev.description ? { body: ev.description } : {}),
    ...(ev.location ? { location: ev.location } : {}),
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params}`;
}

function downloadIcs(ev: Event) {
  const d = new Date(ev.event_date + "T12:00:00");
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Digitally Born//Events//EN",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `SUMMARY:${ev.title}`,
    ev.description ? `DESCRIPTION:${ev.description.replace(/\n/g, "\\n")}` : "",
    ev.location ? `LOCATION:${ev.location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function EventDetail({
  event,
  isRsvped,
  onClose,
}: {
  event: Event;
  isRsvped: boolean;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [rsvped, setRsvped] = useState(isRsvped);
  const [showCalendar, setShowCalendar] = useState(false);

  const toggleRsvp = () => {
    startTransition(async () => {
      if (rsvped) {
        await cancelRsvp(event.id);
        setRsvped(false);
      } else {
        await rsvpToEvent(event.id);
        setRsvped(true);
      }
    });
  };

  const d = new Date(event.event_date + "T12:00:00");
  const dateLabel = `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const meta = [event.event_time, event.location].filter(Boolean).join(" · ");

  return (
    <div className="calendar-detail">
      <div className="calendar-detail-header">
        <div>
          <h3>{event.title}</h3>
          <span className="event-type">{event.type}</span>
        </div>
        <button className="calendar-detail-close" onClick={onClose} aria-label="Close">
          <IconClose />
        </button>
      </div>
      <div className="calendar-detail-meta">
        {dateLabel}{meta ? ` · ${meta}` : ""}
      </div>
      {event.description && <p className="calendar-detail-desc">{event.description}</p>}

      <div className="calendar-detail-actions">
        <button
          className={`btn ${rsvped ? "btn-ghost" : "btn-accent"}`}
          style={{ fontSize: "0.82rem", padding: "8px 20px" }}
          onClick={toggleRsvp}
          disabled={pending}
        >
          {pending ? "…" : rsvped ? "Cancel RSVP" : "RSVP"}
        </button>

        <div className="add-to-calendar">
          <button
            className="btn btn-ghost add-to-cal-btn"
            style={{ fontSize: "0.82rem", padding: "8px 16px" }}
            onClick={() => setShowCalendar(v => !v)}
          >
            Add to calendar <IconChevDown />
          </button>
          {showCalendar && (
            <div className="add-to-calendar-menu">
              <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="calendar-menu-item">
                Google Calendar
              </a>
              <a href={buildOutlookUrl(event)} target="_blank" rel="noopener noreferrer" className="calendar-menu-item">
                Outlook
              </a>
              <button className="calendar-menu-item" onClick={() => downloadIcs(event)}>
                Download .ics (Apple / other)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ events, rsvpedEventIds }: { events: Event[]; rsvpedEventIds: Set<string> }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Event | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
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
    ? today.getDate().toString() : null;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="calendar-wrap">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={prevMonth} aria-label="Previous month">
          <IconChevLeft />
        </button>
        <span className="calendar-title">{MONTH_NAMES[month]} {year}</span>
        <button className="calendar-nav" onClick={nextMonth} aria-label="Next month">
          <IconChevRight />
        </button>
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
            <div key={day} className={`calendar-cell${isToday ? " calendar-cell-today" : ""}`}>
              <div className="calendar-cell-num">{day}</div>
              {dayEvents.map(ev => (
                <button
                  key={ev.id}
                  className={`calendar-event-pill${rsvpedEventIds.has(ev.id) ? " calendar-event-pill-rsvped" : ""}`}
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
        <EventDetail
          event={selected}
          isRsvped={rsvpedEventIds.has(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default function MembersShell({ events, rsvpedEventIds }: Props) {
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
        <div className="slack-banner-arrow"><IconArrow /></div>
      </a>

      <CalendarView events={events} rsvpedEventIds={rsvpedEventIds} />
    </div>
  );
}
