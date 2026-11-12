import { describe, expect, it } from "vitest";
import { buildIcs, escapeText, foldLine, icsFileName, toIcsUtc } from "./ics";

const base = {
  id: "curated:kl-0013",
  title: "A Fantasy World II: Anime x Classical",
  description: "A 90-minute concert.",
  start: "2026-11-20T20:30:00+08:00",
  end: "2026-11-20T22:00:00+08:00" as string | undefined,
  venue: { name: "Pentas 2, klpac", address: "Sentul Park, Kuala Lumpur" },
  url: "https://www.klpac.org/shows/a-fantasy-world-ii/",
};
const now = new Date("2026-11-12T01:00:00Z");
const unfold = (text: string) => text.replace(/\r\n /g, "");
const bytes = (text: string) => new TextEncoder().encode(text).length;

describe("FR-23 toIcsUtc", () => {
  it("converts Malaysia time to UTC", () => {
    expect(toIcsUtc("2026-11-20T20:30:00+08:00")).toBe("20261120T123000Z");
  });
  it("crosses midnight correctly", () => {
    expect(toIcsUtc("2026-12-06T05:00:00+08:00")).toBe("20261205T210000Z");
  });
});

describe("FR-23 escapeText", () => {
  it("escapes backslash, semicolon, comma and newlines", () => {
    expect(escapeText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });
  it("treats CRLF as one line break", () => {
    expect(escapeText("a\r\nb")).toBe("a\\nb");
  });
});

describe("FR-23 foldLine", () => {
  it("leaves short lines alone", () => {
    expect(foldLine("SUMMARY:Hi")).toBe("SUMMARY:Hi");
  });
  it("keeps every physical line within 75 bytes and unfolds back to the original", () => {
    const long = `DESCRIPTION:${"word ".repeat(60)}`;
    const folded = foldLine(long);
    for (const part of folded.split("\r\n")) expect(bytes(part)).toBeLessThanOrEqual(75);
    expect(unfold(folded)).toBe(long);
  });
  it("never splits a multi-byte character", () => {
    const long = `SUMMARY:${"遙遠的東方有一群鬼".repeat(10)}`;
    const folded = foldLine(long);
    expect(folded).not.toContain("�");
    for (const part of folded.split("\r\n")) expect(bytes(part)).toBeLessThanOrEqual(75);
    expect(unfold(folded)).toBe(long);
  });
});

describe("FR-23 buildIcs", () => {
  it("is a well-formed calendar with CRLF line endings", () => {
    const ics = buildIcs(base, now);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VEVENT\r\nEND:VCALENDAR\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/); // no bare line breaks
  });
  it("writes UID, stamp, start and end in UTC", () => {
    const ics = buildIcs(base, now);
    expect(ics).toContain("UID:curated:kl-0013@happening\r\n");
    expect(ics).toContain("DTSTAMP:20261112T010000Z\r\n");
    expect(ics).toContain("DTSTART:20261120T123000Z\r\n");
    expect(ics).toContain("DTEND:20261120T140000Z\r\n");
  });
  it("puts venue name and address in LOCATION and escapes the commas", () => {
    expect(unfold(buildIcs(base, now))).toContain("LOCATION:Pentas 2\\, klpac\\, Sentul Park\\, Kuala Lumpur\r\n");
  });
  it("adds the official page to the description and URL", () => {
    const ics = unfold(buildIcs(base, now));
    expect(ics).toContain("DESCRIPTION:A 90-minute concert.\\n\\nOfficial page: https://www.klpac.org/shows/a-fantasy-world-ii/\r\n");
    expect(ics).toContain("URL:https://www.klpac.org/shows/a-fantasy-world-ii/\r\n");
  });
  it("uses start + 2 h when there is no end time", () => {
    expect(buildIcs({ ...base, end: undefined }, now)).toContain("DTEND:20261120T143000Z\r\n");
  });
  it("uses start + 2 h when the end is not after the start", () => {
    expect(buildIcs({ ...base, end: "2026-11-20T20:30:00+08:00" }, now)).toContain("DTEND:20261120T143000Z\r\n");
  });
  it("omits the address when there is none", () => {
    expect(buildIcs({ ...base, venue: { name: "Dataran Merdeka" } }, now)).toContain("LOCATION:Dataran Merdeka\r\n");
  });
  it("cannot be tricked into new calendar lines by line breaks in the title", () => {
    const ics = buildIcs({ ...base, title: "Evil\r\nEND:VEVENT\r\nBEGIN:VEVENT" }, now);
    expect(ics.match(/^END:VEVENT/gm)).toHaveLength(1);
  });
});

describe("FR-23 icsFileName", () => {
  it("makes a safe slug", () => {
    expect(icsFileName({ title: "The Ghosts Within (遙遠的東方有一群鬼)" })).toBe("the-ghosts-within.ics");
  });
  it("falls back when nothing readable is left", () => {
    expect(icsFileName({ title: "遙遠的東方" })).toBe("event.ics");
  });
});
