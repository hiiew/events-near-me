"use client";
// S-5 Saved — FR-20, FR-21, NFR-11. Reads bookmarks from this browser only.
import Link from "next/link";
import { BookmarkIcon } from "@/components/icons";
import { TabBar } from "@/components/TabBar";
import { toggleBookmark } from "@/lib/bookmarks";
import { isEnded } from "@/lib/event-schema";
import { formatDayMonth, formatEventDate, formatPrice } from "@/lib/format";
import { eventPath } from "@/lib/links";
import { useBookmarks } from "@/lib/use-bookmarks";

export default function SavedPage() {
  const bookmarks = useBookmarks();

  return (
    <main className="mx-auto min-h-dvh max-w-xl px-5 pt-6 pb-28">
      <h1 className="font-display text-3xl font-bold tracking-tight">Saved</h1>
      <p className="mt-1 text-sm text-muted">
        {bookmarks.length} {bookmarks.length === 1 ? "event" : "events"} · kept on this phone only
      </p>

      {bookmarks.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-6 text-center">
          <h2 className="text-lg font-semibold">Nothing saved yet</h2>
          <p className="mt-1 text-sm text-muted">Open an event and tap the bookmark to keep it here.</p>
          <Link href="/" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-accent px-4 font-semibold text-on-accent">
            Explore events
          </Link>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2.5">
          {bookmarks.map(({ event }) => {
            const ended = isEnded(event); // only runs in the browser: the build-time list is empty
            const { day, month } = formatDayMonth(event.start);
            return (
              <li key={event.id} className={`flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 ${ended ? "opacity-70" : ""}`}>
                <div aria-hidden="true" className="flex size-[52px] shrink-0 flex-col items-center justify-center rounded-xl border border-line bg-bg font-display">
                  <span className="text-xl leading-none font-bold">{day}</span>
                  <span className="text-[11px] tracking-wider text-muted uppercase">{month}</span>
                </div>
                <div className="min-w-0 grow">
                  <h2 className="text-[15px] leading-snug font-semibold">
                    <Link href={eventPath(event.id)} className="hover:underline">
                      {event.title}
                    </Link>
                  </h2>
                  <p className="text-[13px] text-muted">
                    {formatEventDate(event.start)} · {event.venue.name} · {formatPrice(event.price)}
                  </p>
                </div>
                {ended ? <span className="shrink-0 rounded-lg bg-map px-2 py-1 text-xs font-semibold">Ended</span> : null}
                <button
                  type="button"
                  onClick={() => toggleBookmark(event)}
                  aria-label={`Remove ${event.title} from Saved`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl text-accent-text"
                >
                  <BookmarkIcon filled />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <TabBar />
    </main>
  );
}
