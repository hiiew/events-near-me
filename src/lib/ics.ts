// D-11 — FR-23: build an iCalendar (.ics) file for one event. Pure functions, no browser APIs,
// so they are easy to test (coding-standards rule 2). Times are written in UTC ("...Z") so every
// calendar app shows the right local time. The file is made on the device, so nothing is sent
// anywhere and no location data is involved (NFR-09, NFR-10).
import type { Event } from "./event-schema";

type IcsEvent = Pick<Event, "id" | "title" | "description" | "start" | "end" | "venue" | "url">;

/** Events with no end time (or a broken one) get this length in the calendar. */
const DEFAULT_DURATION_MS = 2 * 3_600_000;
const encoder = new TextEncoder();

/** "2026-11-20T20:30:00+08:00" → "20261120T123000Z". */
export function toIcsUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escape a TEXT value (RFC 5545 §3.3.11): backslash, semicolon, comma and line breaks. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Lines may not be longer than 75 octets (bytes), so longer ones continue on the next line
 * after CRLF + one space. Counts UTF-8 bytes and never splits a character (e.g. Chinese titles).
 */
export function foldLine(line: string): string {
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  let limit = 75;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = char;
      bytes = size;
      limit = 74; // the leading space of a continuation line uses one octet
    } else {
      current += char;
      bytes += size;
    }
  }
  parts.push(current);
  return parts.join("\r\n ");
}

/** End of the calendar entry: the event's end, or start + 2 h when it is missing or not after the start. */
function endOf(event: Pick<Event, "start" | "end">): string {
  const start = Date.parse(event.start);
  const end = event.end ? Date.parse(event.end) : NaN;
  return toIcsUtc(new Date(end > start ? end : start + DEFAULT_DURATION_MS).toISOString());
}

/** The full .ics text for one event (CRLF line endings, as the standard requires). */
export function buildIcs(event: IcsEvent, now: Date = new Date()): string {
  // FR-23
  const location = [event.venue.name, event.venue.address].filter(Boolean).join(", ");
  const description = [event.description, `Official page: ${event.url}`].filter(Boolean).join("\n\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Happening//Events near you//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@happening`,
    `DTSTAMP:${toIcsUtc(now.toISOString())}`,
    `DTSTART:${toIcsUtc(event.start)}`,
    `DTEND:${endOf(event)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${event.url}`, // already validated as https:// by EventSchema; URI values are not text-escaped
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** Safe download name from the title, e.g. "the-ghosts-within.ics". */
export function icsFileName(event: Pick<Event, "title">): string {
  const slug = event.title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  return `${slug || "event"}.ics`;
}
