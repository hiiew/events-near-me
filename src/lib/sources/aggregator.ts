// FR-24, FR-28, NFR-12 — ask every enabled source in parallel and merge the results.
// One slow or broken source must never break the whole search.
import type { Event, SourceStatus } from "../event-schema";
import type { SourceAdapter, SourceQuery } from "./types";

export const SOURCE_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function searchAllSources(
  adapters: SourceAdapter[],
  query: SourceQuery,
  timeoutMs = SOURCE_TIMEOUT_MS,
): Promise<{ events: Event[]; sources: SourceStatus[] }> {
  const enabled = adapters.filter((a) => a.isEnabled());
  // Start every source at once (async-parallel), each with its own timeout.
  const results = await Promise.allSettled(
    enabled.map((a) => withTimeout(a.getEvents(query), timeoutMs)),
  );

  const events: Event[] = [];
  const sources: SourceStatus[] = results.map((r, i) => {
    const id = enabled[i].id;
    if (r.status === "fulfilled") {
      events.push(...r.value);
      return { id, ok: true, count: r.value.length };
    }
    // Log the source and reason only — never the query point (NFR-10).
    console.warn(`[aggregator] source "${id}" failed: ${(r.reason as Error)?.message ?? "unknown error"}`);
    return { id, ok: false, count: 0 };
  });

  events.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  return { events, sources };
}
