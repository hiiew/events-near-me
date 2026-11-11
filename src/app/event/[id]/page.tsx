// S-4 Event detail — FR-17, FR-18, FR-19, FR-20, FR-22, FR-32 (source attribution).
// Server component: the event is looked up on the server by id, so shared links work.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { DistanceFromSearch } from "@/components/DistanceFromSearch";
import { SaveButton, ShareButton } from "@/components/EventActions";
import { BackIcon, CalendarIcon, DirectionsIcon, ExternalIcon, PinIcon, TagIcon } from "@/components/icons";
import { CATEGORY_LABELS } from "@/lib/categories";
import { formatEventWhen, formatPrice } from "@/lib/format";
import { googleMapsDirectionsUrl, wazeUrl } from "@/lib/links";
import { isEnded } from "@/lib/event-schema";
import { getCuratedEvent } from "@/lib/sources/curated";

export const metadata: Metadata = { title: "Event — Happening" };

const SOURCE_NAMES = { curated: "Curated by Happening", eventbrite: "Eventbrite", predicthq: "PredictHQ" } as const;

export default function EventPage({ params }: PageProps<"/event/[id]">) {
  return (
    <main className="mx-auto min-h-dvh max-w-xl px-5 pt-4 pb-10">
      <Suspense fallback={<p className="pt-24 text-muted">Loading event…</p>}>
        {params.then(({ id }) => (
          <EventDetail id={decodeURIComponent(id)} /* Next passes the param still encoded; it rejects malformed % itself */ />
        ))}
      </Suspense>
    </main>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-4 pt-24">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="text-muted">{body}</p>
      <Link href="/" className="flex min-h-[54px] items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent">
        Find events near you
      </Link>
    </div>
  );
}

async function EventDetail({ id }: { id: string }) {
  await connection(); // "has it ended?" depends on the time of the request
  const event = getCuratedEvent(id); // shortcut: curated events only; add the Eventbrite lookup when that source ships
  if (!event) return <Notice title="This event isn't available" body="It may have been removed by the organiser." />;
  if (isEnded(event)) return <Notice title="This event has ended" body={`${event.title} is over. Find something else happening near you.`} />;

  const when = formatEventWhen(event.start, event.end);
  const isSample = event.title.startsWith("SAMPLE");

  return (
    <article className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Back to Explore" className="flex size-11 items-center justify-center rounded-[14px] border border-line">
          <BackIcon />
        </Link>
        <div className="flex gap-2">
          <ShareButton event={event} />
          <SaveButton event={event} />
        </div>
      </div>

      <p className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-lg border border-line bg-surface px-2.5 py-1">{CATEGORY_LABELS[event.category]}</span>
        {isSample ? <span className="rounded-lg border border-line bg-surface px-2.5 py-1 text-muted">Sample event</span> : null}
      </p>
      <h1 className="font-display text-[32px] leading-[1.05] font-bold tracking-tight">{event.title}</h1>

      {event.imageUrl ? (
        // unoptimized: images come from organisers' own sites, so no image-domain list to maintain
        <Image src={event.imageUrl} alt={event.title} width={800} height={450} unoptimized className="aspect-video w-full rounded-2xl object-cover" />
      ) : null}

      <dl className="flex flex-col gap-3">
        <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-2.5">
          <CalendarIcon className="text-accent-text" />
          <div>
            <dt className="sr-only">When</dt>
            <dd className="font-semibold">{when.day}</dd>
            <dd className="text-sm text-muted">{when.time} (Malaysia time)</dd>
          </div>
        </div>
        <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-2.5">
          <PinIcon className="text-accent-text" />
          <div>
            <dt className="sr-only">Where</dt>
            <dd className="font-semibold">{event.venue.name}</dd>
            {event.venue.address ? <dd className="text-sm text-muted">{event.venue.address}</dd> : null}
            <DistanceFromSearch venue={event.venue} />
          </div>
        </div>
        <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-2.5">
          <TagIcon className="text-accent-text" />
          <div>
            <dt className="sr-only">Price</dt>
            <dd className="font-semibold">{formatPrice(event.price)}</dd>
          </div>
        </div>
      </dl>

      {event.description ? <p className="leading-relaxed whitespace-pre-line text-muted">{event.description}</p> : null}

      <div className="flex flex-col gap-2.5 pt-2">
        <a
          href={googleMapsDirectionsUrl(event.venue)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-on-accent"
        >
          <DirectionsIcon /> Directions (Google Maps)
        </a>
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-line font-semibold"
        >
          View official page <ExternalIcon />
        </a>
        <p className="text-center text-sm text-muted">
          <a href={wazeUrl(event.venue)} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline-offset-4 hover:underline">
            Open in Waze instead
          </a>{" "}
          · Source: {SOURCE_NAMES[event.sourceId]}
        </p>
      </div>
    </article>
  );
}
