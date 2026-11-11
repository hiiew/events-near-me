// D-04 — FR-20, FR-21, NFR-11. Bookmarks live only in this browser (localStorage).
// A snapshot of each event is kept so Saved still works if a source drops it.
import { z } from "zod";
import { EventSchema, type Event } from "./event-schema";

const KEY = "happening.bookmarks.v1";
const CHANGED = "happening:bookmarks";

const BookmarksSchema = z.array(z.object({ savedAt: z.string(), event: EventSchema }));
export type Bookmark = z.infer<typeof BookmarksSchema>[number];

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const browserStore = (): Store | null => (typeof localStorage === "undefined" ? null : localStorage);

/** Raw stored text (stable string for useSyncExternalStore). */
export function readRaw(store: Store | null = browserStore()): string {
  try {
    return store?.getItem(KEY) ?? "[]";
  } catch {
    return "[]"; // storage blocked (private mode etc.): behave as empty
  }
}

/** Parsed bookmarks; anything malformed is ignored (re-validated: links stay https-only, T-04). */
export function parseBookmarks(raw: string): Bookmark[] {
  try {
    const parsed = BookmarksSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function write(list: Bookmark[], store: Store | null) {
  try {
    store?.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full or blocked: nothing else to do */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CHANGED));
}

export function toggleBookmark(event: Event, store: Store | null = browserStore(), now = new Date()): boolean {
  const list = parseBookmarks(readRaw(store));
  const saved = list.some((b) => b.event.id === event.id);
  write(saved ? list.filter((b) => b.event.id !== event.id) : [{ savedAt: now.toISOString(), event }, ...list], store);
  return !saved;
}

export function clearBookmarks(store: Store | null = browserStore()) {
  try {
    store?.removeItem(KEY);
  } catch {
    /* blocked */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CHANGED));
}

/** For useSyncExternalStore: re-read when this tab or another tab changes bookmarks. */
export function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}
