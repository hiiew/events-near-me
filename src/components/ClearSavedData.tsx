"use client";
// NFR-11 — remove everything Happening keeps in this browser.
import { clearBookmarks } from "@/lib/bookmarks";
import { useBookmarks } from "@/lib/use-bookmarks";

export function ClearSavedData() {
  const count = useBookmarks().length;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => clearBookmarks()}
        disabled={count === 0}
        className="min-h-11 rounded-xl border border-line px-4 font-semibold disabled:opacity-50"
      >
        Clear saved data
      </button>
      <p role="status" aria-live="polite" className="text-sm text-muted">
        {count === 0 ? "Nothing saved on this phone." : `${count} saved ${count === 1 ? "event" : "events"} on this phone.`}
      </p>
    </div>
  );
}
