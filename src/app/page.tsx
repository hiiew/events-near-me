"use client";
// S-1 Welcome + S-2 Explore list — FR-01, FR-04, FR-06, FR-15, FR-28, NFR-05, NFR-09.
// A client component because it uses the browser's location and React state.
import { useState } from "react";
import { EventCard } from "@/components/EventCard";
import type { SearchResponse } from "@/lib/event-schema";
import { DEFAULT_RADIUS_KM, nearbyEvents, type EventWithDistance } from "@/lib/filters";
import type { LatLon } from "@/lib/geo";
import { getDeviceLocation, type LocationError } from "@/lib/location";

type State =
  | { kind: "welcome" }
  | { kind: "locating" }
  | { kind: "loading" }
  | { kind: "location-error"; reason: LocationError }
  | { kind: "fetch-error" }
  | { kind: "results"; events: EventWithDistance[]; someSourcesDown: boolean };

const LOCATION_MESSAGES: Record<LocationError, string> = {
  denied: "Location permission was turned off, so we can't see where you are.",
  timeout: "Finding your location took too long.",
  unavailable: "We couldn't get your location right now.",
  unsupported: "This browser can't share its location.",
};

async function searchEvents(point: LatLon): Promise<SearchResponse> {
  const res = await fetch("/api/events/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(point), // already rounded to 3 dp (NFR-09)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function ExplorePage() {
  const [state, setState] = useState<State>({ kind: "welcome" });

  async function findEventsNearMe() {
    setState({ kind: "locating" });
    let point: LatLon;
    try {
      point = await getDeviceLocation();
    } catch (reason) {
      setState({ kind: "location-error", reason: reason as LocationError });
      return;
    }
    setState({ kind: "loading" });
    try {
      const data = await searchEvents(point);
      setState({
        kind: "results",
        events: nearbyEvents(data.events, point, DEFAULT_RADIUS_KM),
        someSourcesDown: data.sources.some((s) => !s.ok),
      });
    } catch {
      setState({ kind: "fetch-error" });
    }
  }

  const busy = state.kind === "locating" || state.kind === "loading";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-10 pt-6">
      <header className="flex items-center gap-2">
        <span aria-hidden="true" className="text-3xl">🎉</span>
        <p className="text-2xl font-black tracking-tight text-ink">Happening</p>
      </header>

      {state.kind === "welcome" || busy ? (
        <section aria-labelledby="welcome-title" className="mt-10 flex flex-col">
          <h1 id="welcome-title" className="text-3xl font-black leading-tight text-ink">
            Find what&apos;s on near you
          </h1>
          <p className="mt-3 text-lg text-muted">Gigs, markets, workshops, meetups &amp; more.</p>

          <div className="mt-8 rounded-2xl border border-line bg-surface p-4">
            <p className="text-base text-ink">
              <span aria-hidden="true">📍 </span>
              We use your location only to find nearby events. It&apos;s rounded to about 100&nbsp;m and
              never stored.
            </p>
          </div>

          <button
            type="button"
            onClick={findEventsNearMe}
            disabled={busy}
            className="mt-6 min-h-12 rounded-2xl bg-primary px-6 text-lg font-extrabold text-on-primary shadow-[0_4px_14px_rgba(109,40,217,0.3)] transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {state.kind === "locating"
              ? "Finding your location…"
              : state.kind === "loading"
                ? "Finding events…"
                : "📍 Use my location"}
          </button>
          <p role="status" aria-live="polite" className="sr-only">
            {busy ? (state.kind === "locating" ? "Finding your location" : "Finding events") : ""}
          </p>
        </section>
      ) : null}

      {state.kind === "location-error" ? (
        <section aria-labelledby="loc-error-title" className="mt-10" role="alert">
          <h1 id="loc-error-title" className="text-2xl font-black text-ink">
            We couldn&apos;t get your location
          </h1>
          <p className="mt-3 text-base text-muted">{LOCATION_MESSAGES[state.reason]}</p>
          <p className="mt-2 text-base text-muted">
            Picking a spot on the map is coming in the next update. For now, you can allow location
            in your browser settings and try again.
          </p>
          <button
            type="button"
            onClick={findEventsNearMe}
            className="mt-6 min-h-12 rounded-2xl bg-primary px-6 text-base font-extrabold text-on-primary"
          >
            Try again
          </button>
        </section>
      ) : null}

      {state.kind === "fetch-error" ? (
        <section aria-labelledby="fetch-error-title" className="mt-10" role="alert">
          <h1 id="fetch-error-title" className="text-2xl font-black text-ink">
            Something went wrong
          </h1>
          <p className="mt-3 text-base text-muted">We couldn&apos;t load events. Check your connection and try again.</p>
          <button
            type="button"
            onClick={findEventsNearMe}
            className="mt-6 min-h-12 rounded-2xl bg-primary px-6 text-base font-extrabold text-on-primary"
          >
            Try again
          </button>
        </section>
      ) : null}

      {state.kind === "results" ? (
        <section aria-labelledby="results-title" className="mt-6">
          <h1 id="results-title" className="text-2xl font-black text-ink">
            Events near you
          </h1>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <p role="status" aria-live="polite" className="text-sm font-semibold text-muted">
              <span aria-hidden="true">📍 </span>
              Within {DEFAULT_RADIUS_KM} km · {state.events.length}{" "}
              {state.events.length === 1 ? "event" : "events"} · soonest first
            </p>
            <button
              type="button"
              onClick={findEventsNearMe}
              className="-mx-3 min-h-11 rounded-xl px-3 text-sm font-bold text-primary hover:underline"
            >
              Refresh location
            </button>
          </div>

          {state.someSourcesDown ? (
            <p className="mt-3 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm font-semibold text-warning">
              <span aria-hidden="true">⚠️ </span>Some sources are unavailable right now.
            </p>
          ) : null}

          {state.events.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-6 text-center">
              <p aria-hidden="true" className="text-4xl">🔍</p>
              <h2 className="mt-2 text-lg font-extrabold text-ink">No events within {DEFAULT_RADIUS_KM} km</h2>
              <p className="mt-1 text-sm text-muted">
                Try again later — a wider radius and filters are coming in the next update.
              </p>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {state.events.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <footer className="mt-auto pt-10 text-center text-xs text-muted">
        Events from Happening&apos;s curated list. Always check the official page before you go.
      </footer>
    </main>
  );
}
