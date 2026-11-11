import { describe, expect, it } from "vitest";
import { formatDayMonth, formatDistance, formatEventDate, formatPrice } from "./format";

const NOW = new Date("2026-11-11T12:00:00+08:00");

describe("NFR-18 formatEventDate (Malaysia time)", () => {
  it("formats a same-year date without the year", () => {
    expect(formatEventDate("2026-12-05T10:00:00+08:00", NOW)).toBe("Sat 5 Dec · 10:00 AM");
  });

  it("converts UTC to Malaysia time (crosses midnight)", () => {
    // 23:30 UTC on Sat 5 Dec = 07:30 on Sun 6 Dec in Malaysia
    expect(formatEventDate("2026-12-05T23:30:00Z", NOW)).toBe("Sun 6 Dec · 7:30 AM");
  });

  it("adds the year when it is not this year", () => {
    expect(formatEventDate("2027-01-17T20:00:00+08:00", NOW)).toBe("Sun 17 Jan 2027 · 8:00 PM");
  });
});

describe("NFR-18 / FR-13 formatPrice", () => {
  it.each([
    [{ min: 0, currency: "MYR" }, "FREE"],
    [{ min: 35, currency: "MYR" }, "RM 35.00"],
    [{ min: 20, max: 80, currency: "MYR" }, "RM 20.00 – RM 80.00"],
    [{ min: 15, currency: "USD" }, "USD 15.00"],
    [{ min: 0, max: 50, currency: "MYR" }, "RM 0.00 – RM 50.00"],
    [null, "Price not listed"],
  ] as const)("%o → %s", (price, expected) => {
    expect(formatPrice(price)).toBe(expected);
  });
});

describe("formatDistance", () => {
  it("shows one decimal", () => {
    expect(formatDistance(2.4321)).toBe("2.4 km");
    expect(formatDistance(10)).toBe("10.0 km");
  });
});

describe("NFR-18 formatDayMonth", () => {
  it("uses Malaysia's date (23:30 UTC on 5 Dec = 6 Dec in MYT)", () => {
    expect(formatDayMonth("2026-12-05T23:30:00Z")).toEqual({ day: "6", month: "Dec" });
  });
});
