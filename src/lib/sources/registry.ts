// NFR-14 — the list of available sources. Adding a source = one new adapter file + one line here.
import { curatedAdapter } from "./curated";
import type { SourceAdapter } from "./types";

const ALL_ADAPTERS: SourceAdapter[] = [curatedAdapter];

/**
 * Sources named in ENABLED_SOURCES (default: curated only).
 * An empty or blank value also means the default: a variable saved empty in the hosting dashboard
 * must not switch every source off and leave every search empty (FR-24, NFR-12).
 */
export function getEnabledAdapters(enabledSources = process.env.ENABLED_SOURCES): SourceAdapter[] {
  const wanted = new Set(
    (enabledSources?.trim() || "curated")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return ALL_ADAPTERS.filter((a) => wanted.has(a.id));
}
