interface CalendarEvent {
  id: string;
  title: string;
  /** ISO date or datetime. Events only store a calendar day today, so this becomes an all-day entry. */
  date: string;
  location?: string;
  description?: string;
  url?: string;
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);
}

function ymd(d: Date): string {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** Download an .ics file that opens in Google Calendar, Apple Calendar and Outlook. */
export function downloadCalendarEvent(event: CalendarEvent) {
  const start = new Date(event.date);
  if (isNaN(start.getTime())) return;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kun Khmer//Public Site//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@kunkhmer`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART;VALUE=DATE:${ymd(start)}`,
    `DTEND;VALUE=DATE:${ymd(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    event.location && `LOCATION:${escapeIcs(event.location)}`,
    event.description && `DESCRIPTION:${escapeIcs(event.description)}`,
    event.url && `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `${event.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "event"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
