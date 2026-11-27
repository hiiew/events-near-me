// NFR-14, FR-24, NFR-12 — which sources run, given the ENABLED_SOURCES setting.
import { describe, expect, it } from "vitest";
import { getEnabledAdapters } from "./registry";

const ids = (value: string | undefined) => getEnabledAdapters(value).map((a) => a.id);

describe("getEnabledAdapters", () => {
  it("uses the curated source when the setting is missing", () => {
    expect(ids(undefined)).toEqual(["curated"]);
  });

  it("uses the curated source when the setting is empty or blank (saved empty in Vercel)", () => {
    expect(ids("")).toEqual(["curated"]);
    expect(ids("   ")).toEqual(["curated"]);
  });

  it("accepts a list with spaces and ignores sources that are not built yet", () => {
    expect(ids(" curated , eventbrite ")).toEqual(["curated"]);
  });

  it("switches the curated source off when the setting names only other sources", () => {
    expect(ids("eventbrite")).toEqual([]);
  });
});
