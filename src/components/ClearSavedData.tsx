"use client";
// NFR-11, FR-40 — remove everything Happening keeps in this browser: saved events and the last search.
import { clearBookmarks } from "@/lib/bookmarks";
import { clearLastSearch } from "@/lib/offline-cache";
import { useBookmarks } from "@/lib/use-bookmarks";

export function ClearSavedData() {
  const count = useBookmarks().length;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => {
          clearBookmarks();
          clearLastSearch();
        }}
        className="min-h-11 rounded-xl border border-line px-4 font-semibold"
      >
        Clear saved data
      </button>
      <p role="status" aria-live="polite" className="text-sm text-muted">
        {count === 0 ? "No saved events on this phone." : `${count} saved ${count === 1 ? "event" : "events"} on this phone.`}
      </p>
    </div>
  );
}
