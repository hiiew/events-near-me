"use client";
// FR-35 (CR-05): search box above the results list. It only holds what was typed; the matching
// (title, venue, address, category; accents and case ignored) is `matchesQuery` in src/lib/filters.ts.
import { SearchIcon } from "./icons";

export function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <label htmlFor="event-search" className="sr-only">
        Search events
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
      <input
        id="event-search"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search events or places"
        className="min-h-11 w-full rounded-[14px] border border-line bg-surface pr-3 pl-10 text-[15px] placeholder:text-muted"
      />
    </div>
  );
}
