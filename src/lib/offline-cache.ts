// D-04 — FR-40 (CR-10), NFR-11. The events from the last successful search are kept in this browser
// (localStorage) so the list can still be shown when the server can't be reached.
// Privacy (security-privacy.md §4): only public event data and the save time are stored. The search point is
// deliberately NOT stored, so the user's location never reaches localStorage (NFR-09, NFR-10). The offline list
// is filtered around whatever point the visitor picks next. "Clear saved data" removes it.
import { z } from "zod";
import { EventSchema, type Event } from "./event-schema";

const KEY = "happening.lastsearch.v1";

const LastSearchSchema = z.object({
  savedAt: z.string(),
  events: z.array(EventSchema),
});
export type LastSearch = z.infer<typeof LastSearchSchema>;

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const browserStore = (): Store | null => (typeof localStorage === "undefined" ? null : localStorage);

export function saveLastSearch(events: Event[], store: Store | null = browserStore(), now = new Date()) {
  try {
    store?.setItem(KEY, JSON.stringify({ savedAt: now.toISOString(), events } satisfies LastSearch));
  } catch {
    /* storage full or blocked: offline mode just won't have data */
  }
}

/** The saved search, or null when there is none or it is malformed (re-validated, links stay https-only, T-04). */
export function loadLastSearch(store: Store | null = browserStore()): LastSearch | null {
  try {
    const raw = store?.getItem(KEY);
    if (!raw) return null;
    const parsed = LastSearchSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null; // blocked storage or broken JSON
  }
}

export function clearLastSearch(store: Store | null = browserStore()) {
  try {
    store?.removeItem(KEY);
  } catch {
    /* blocked */
  }
}
