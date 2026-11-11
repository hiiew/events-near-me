// FR-06, FR-09, FR-17 (opens details), FR-18 (link), NFR-05, NFR-18 — one event in the Explore sheet (Night Map row).
import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/categories";
import type { EventWithDistance } from "@/lib/filters";
import { formatDayMonth, formatDistance, formatEventDate, formatPrice } from "@/lib/format";
import { eventPath } from "@/lib/links";
import { ExternalIcon } from "./icons";

export function EventRow({ event, selected }: { event: EventWithDistance; selected: boolean }) {
  const { day, month } = formatDayMonth(event.start);
  const price = formatPrice(event.price);
  const where =
    event.distanceKm === undefined
      ? `${event.venue.name} · not on map`
      : `${event.venue.name} · ${formatDistance(event.distanceKm)}`;

  return (
    <article
      id={`event-${event.id}`}
      className={`flex items-center gap-3 border-b border-line py-3 ${selected ? "-mx-3 rounded-xl bg-surface px-3" : ""}`}
    >
      <div className="w-12 shrink-0 text-center font-display" aria-hidden="true">
        <div className="text-xl leading-none font-bold">{day}</div>
        <div className="text-[11px] tracking-wider text-muted uppercase">{month}</div>
      </div>
      <div className="min-w-0 grow">
        <h2 className="line-clamp-2 text-[15px] leading-snug font-semibold">
          <Link href={eventPath(event.id)} className="hover:underline">
            {event.title}
          </Link>
        </h2>
        <p className="truncate text-[13px] text-muted">
          <time dateTime={event.start}>{formatEventDate(event.start)}</time> · {where}
        </p>
        <p className="mt-1 flex flex-wrap gap-1.5 text-xs font-semibold">
          <span className={`rounded-lg px-2 py-0.5 ${price === "FREE" ? "bg-accent text-on-accent" : "bg-map"}`}>
            {price}
          </span>
          <span className="rounded-lg bg-map px-2 py-0.5 text-muted">{CATEGORY_LABELS[event.category]}</span>
        </p>
      </div>
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-accent-text hover:bg-surface"
      >
        <ExternalIcon />
        <span className="sr-only">Official page for {event.title} (opens in a new tab)</span>
      </a>
    </article>
  );
}
