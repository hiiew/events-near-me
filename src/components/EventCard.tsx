// FR-06, FR-09, FR-17 (partial), NFR-05, NFR-18 — one event in the Explore list.
import { CATEGORY_META } from "@/lib/categories";
import type { EventWithDistance } from "@/lib/filters";
import { formatDistance, formatEventDate, formatPrice } from "@/lib/format";

export function EventCard({ event }: { event: EventWithDistance }) {
  const category = CATEGORY_META[event.category];
  const price = formatPrice(event.price);
  const isFree = price === "FREE";

  return (
    <article className="rounded-2xl border border-line bg-surface p-4 shadow-[0_2px_8px_rgba(30,27,46,0.06)]">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
        <span aria-hidden="true">{category.emoji}</span>
        {category.label}
      </p>

      <h2 className="mt-2 text-lg font-extrabold leading-snug text-ink">{event.title}</h2>

      <p className="mt-1 text-sm font-semibold text-ink">
        <time dateTime={event.start}>{formatEventDate(event.start)}</time>
      </p>

      <p className="mt-1 text-sm text-muted">
        <span aria-hidden="true">📍 </span>
        {event.venue.name}
        {event.distanceKm === undefined ? (
          <> · Location on map not available</>
        ) : (
          <> · {formatDistance(event.distanceKm)} away</>
        )}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        {isFree ? (
          <span className="rounded-full bg-sunny px-3 py-1 text-sm font-extrabold text-[#1e1b2e]">FREE</span>
        ) : (
          <span className="text-sm font-bold text-ink">{price}</span>
        )}
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-bold text-primary underline-offset-4 hover:underline"
        >
          Official page
          <span aria-hidden="true">&nbsp;↗</span>
          <span className="sr-only"> for {event.title} (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
