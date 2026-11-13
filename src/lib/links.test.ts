import { describe, expect, it } from "vitest";
import { eventPath, googleMapsDirectionsUrl, googleMapsTransitUrl, shareData, sharePreview, wazeUrl } from "./links";

const withCoords = { name: "KLCC Park", lat: 3.1544, lon: 101.7146 };
const noCoords = { name: "Somewhere Hall", address: "Jalan X, KL" };

describe("FR-19 directions", () => {
  it("Google Maps uses coordinates when known", () => {
    expect(googleMapsDirectionsUrl(withCoords)).toBe("https://www.google.com/maps/dir/?api=1&destination=3.1544%2C101.7146");
  });

  it("Google Maps falls back to name + address", () => {
    expect(googleMapsDirectionsUrl(noCoords)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=Somewhere%20Hall%2C%20Jalan%20X%2C%20KL",
    );
  });

  it("Waze uses coordinates or a search", () => {
    expect(wazeUrl(withCoords)).toBe("https://waze.com/ul?ll=3.1544,101.7146&navigate=yes");
    expect(wazeUrl(noCoords)).toBe("https://waze.com/ul?q=Somewhere%20Hall&navigate=yes");
  });
});

describe("FR-38 public transport", () => {
  it("is the Google Maps directions link in transit mode", () => {
    expect(googleMapsTransitUrl(withCoords)).toBe("https://www.google.com/maps/dir/?api=1&destination=3.1544%2C101.7146&travelmode=transit");
  });

  it("falls back to name + address like the car link", () => {
    expect(googleMapsTransitUrl(noCoords)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=Somewhere%20Hall%2C%20Jalan%20X%2C%20KL&travelmode=transit",
    );
  });
});

describe("FR-22 share", () => {
  it("event path encodes the id", () => {
    expect(eventPath("curated:kl-0002")).toBe("/event/curated%3Akl-0002");
  });

  it("share text has title and Malaysia-time date", () => {
    const d = shareData({ title: "Indie Night", start: "2026-11-21T20:00:00+08:00" }, "https://x.app/event/1");
    expect(d.text).toMatch(/^Indie Night — Sat 21 Nov · 8:00 PM/);
    expect(d.url).toBe("https://x.app/event/1");
  });
});

describe("FR-37 share preview", () => {
  const base = { title: "Indie Night", start: "2026-11-21T20:00:00+08:00", venue: { name: "KLCC Park" }, price: { min: 0, currency: "MYR" } as never };

  it("title carries the app name; description has date, venue and price", () => {
    const p = sharePreview({ ...base, price: null });
    expect(p.title).toBe("Indie Night — Happening");
    expect(p.description).toMatch(/^Sat 21 Nov · 8:00 PM · KLCC Park · /);
  });

  it("passes the organiser's image through, or nothing", () => {
    expect(sharePreview({ ...base, price: null, imageUrl: "https://example.com/a.jpg" }).imageUrl).toBe("https://example.com/a.jpg");
    expect(sharePreview({ ...base, price: null }).imageUrl).toBeUndefined();
  });
});
