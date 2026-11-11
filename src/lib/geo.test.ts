import { describe, expect, it } from "vitest";
import { haversineKm, roundCoord, roundPoint } from "./geo";

const KLCC = { lat: 3.1579, lon: 101.7116 };

describe("FR-04 haversineKm", () => {
  it("KLCC → KL Sentral ≈ 3.87 km", () => {
    expect(haversineKm(KLCC, { lat: 3.134, lon: 101.6862 })).toBeCloseTo(3.87, 1);
  });

  it("KLCC → Sunway Pyramid ≈ 14.95 km", () => {
    expect(haversineKm(KLCC, { lat: 3.0733, lon: 101.607 })).toBeCloseTo(14.95, 1);
  });

  it("same point → 0", () => {
    expect(haversineKm(KLCC, KLCC)).toBe(0);
  });

  it("is symmetric", () => {
    const b = { lat: 3.2156, lon: 101.7262 };
    expect(haversineKm(KLCC, b)).toBeCloseTo(haversineKm(b, KLCC), 10);
  });
});

describe("NFR-09 roundCoord", () => {
  it.each([
    [3.13956, 3.14],
    [101.68689, 101.687],
    [-6.20888, -6.209],
    [0, 0],
  ])("roundCoord(%d) → %d", (input, expected) => {
    expect(roundCoord(input)).toBe(expected);
  });

  it("rounds both parts of a point", () => {
    expect(roundPoint({ lat: 3.13956, lon: 101.68689 })).toEqual({ lat: 3.14, lon: 101.687 });
  });
});
