// NFR-18 — how dates, prices and distances are shown. Times are always Malaysia time.
import type { Event } from "./event-schema";

const TIME_ZONE = "Asia/Kuala_Lumpur";

// Formatters are created once (creating Intl formatters is relatively slow).
const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, weekday: "short", day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit", hour12: true });
const yearFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, year: "numeric" });

const dayNumFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, month: "short" });

/** Day number and short month in Malaysia time, e.g. { day: "5", month: "Dec" }. */
export function formatDayMonth(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  return { day: dayNumFmt.format(d), month: monthFmt.format(d) };
}

/** e.g. "Sat 5 Dec · 10:00 AM"; adds the year when it isn't this year (in Malaysia time). */
export function formatEventDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const year = yearFmt.format(date);
  const day = year === yearFmt.format(now) ? dayFmt.format(date) : `${dayFmt.format(date)} ${year}`;
  return `${day} · ${timeFmt.format(date)}`;
}

function money(amount: number, currency: string): string {
  const label = currency.toUpperCase() === "MYR" ? "RM" : currency.toUpperCase();
  return `${label} ${amount.toFixed(2)}`;
}

/** "FREE", "RM 35.00", "RM 20.00 – RM 80.00", "USD 15.00" or "Price not listed". */
export function formatPrice(price: Event["price"]): string {
  if (price === null) return "Price not listed";
  if (price.min === 0 && !price.max) return "FREE";
  if (price.max !== undefined && price.max > price.min) {
    return `${money(price.min, price.currency)} – ${money(price.max, price.currency)}`;
  }
  return money(price.min, price.currency);
}

/** "2.4 km" */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}
