// NFR-14 — the list of available sources. Adding a source = one new adapter file + one line here.
import { curatedAdapter } from "./curated";
import type { SourceAdapter } from "./types";

const ALL_ADAPTERS: SourceAdapter[] = [curatedAdapter];

/** Sources named in ENABLED_SOURCES (default: curated only). */
export function getEnabledAdapters(enabledSources = process.env.ENABLED_SOURCES): SourceAdapter[] {
  const wanted = new Set(
    (enabledSources ?? "curated")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return ALL_ADAPTERS.filter((a) => wanted.has(a.id));
}
