"use client";
// S-1 Welcome + S-2/S-3 Explore (Night Map: map + list sheet) — FR-01–FR-15, FR-28, FR-34, FR-35, FR-36, NFR-05, NFR-09.
import dynamic from "next/dynamic";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { EventRow } from "@/components/EventRow";
import { FilterSheet } from "@/components/FilterSheet";
import { FiltersIcon, PinIcon, PlusIcon, ShieldIcon } from "@/components/icons";
import { QuickChip } from "@/components/QuickChip";
import { SearchBox } from "@/components/SearchBox";
import { TabBar } from "@/components/TabBar";
import type { Event, SearchResponse } from "@/lib/event-schema";
import { applyFilters, DEFAULT_FILTERS, isFreeThisWeek, isToday, toggleFreeThisWeek, toggleToday, widerRadius, type Filters } from "@/lib/filters";
import { roundPoint, type LatLon } from "@/lib/geo";
import { getDeviceLocation, type LocationError } from "@/lib/location";
import { rememberSearchPoint } from "@/lib/search-point";

// Leaflet needs the browser, so the map is loaded on the client only (bundle-dynamic-imports).
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="size-full bg-map" />,
});

const KL_CENTER: LatLon = { lat: 3.139, lon: 101.6869 }; // default map centre only (CR-02)

const LOCATION_MESSAGES: Record<LocationError, string> = {
  denied: "Location is off, so pick where to search from.",
  timeout: "Finding your location took too long. Pick a spot instead.",
  unavailable: "We couldn't get your location. Pick a spot instead.",
  unsupported: "This browser can't share its location. Pick a spot instead.",
};

type Status = "idle" | "locating" | "loading" | "ready" | "fetch-error";

async function searchEvents(point: LatLon): Promise<SearchResponse> {
  const res = await fetch("/api/events/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(point), // already rounded to 3 dp (NFR-09)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function Home() {
  // Next.js keeps this page's state while you view an event or another tab (React Activity).
  const [screen, setScreen] = useState<"welcome" | "explore">("welcome");
  const [status, setStatus] = useState<Status>("idle");
  const [point, setPoint] = useState<LatLon | null>(null);
  const [pointKind, setPointKind] = useState<"device" | "pin">("pin");
  const [locError, setLocError] = useState<LocationError | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [someDown, setSomeDown] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const mapCenter = useRef<LatLon>(KL_CENTER);
  const lastSearch = useRef(0); // only the newest search may update the list

  // Leaflet breaks when Activity hides and re-shows its container ("Map container is being
  // reused"), so the map unmounts while this page is hidden and mounts fresh when it shows again.
  const [mapOn, setMapOn] = useState(false);
  useLayoutEffect(() => {
    setMapOn(true); // eslint-disable-line react-hooks/set-state-in-effect -- reacting to Activity show/hide is the point
    return () => setMapOn(false);
  }, []);

  const visible = useMemo(() => (point ? applyFilters(events, point, filters) : []), [events, point, filters]);

  async function searchFrom(p: LatLon, kind: "device" | "pin") {
    rememberSearchPoint(p);
    setPoint(p);
    setPointKind(kind);
    setSelectedId(null);
    setStatus("loading");
    const id = ++lastSearch.current;
    try {
      const data = await searchEvents(p);
      if (id !== lastSearch.current) return; // a newer search started meanwhile
      setEvents(data.events);
      setSomeDown(data.sources.some((s) => !s.ok));
      setStatus("ready");
    } catch {
      if (id === lastSearch.current) setStatus("fetch-error");
    }
  }

  async function locateMe() {
    setScreen("explore");
    setLocError(null);
    setStatus("locating");
    try {
      await searchFrom(await getDeviceLocation(), "device");
    } catch (reason) {
      setLocError(reason as LocationError); // FR-02: fall back to picking a spot
      setStatus("idle");
    }
  }

  function pickOnMap() {
    setScreen("explore");
    setStatus("idle");
  }

  function selectFromMap(id: string) {
    setSelectedId(id);
    setExpanded(false);
    requestAnimationFrame(() => document.getElementById(`event-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  if (screen === "welcome") {
    return (
      <main className="relative mx-auto flex min-h-dvh max-w-xl flex-col overflow-hidden px-6 pt-[38dvh] pb-8">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[46dvh] bg-map">
          <div className="absolute top-[42%] left-1/2 size-5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_0_4px_var(--bg),0_0_0_16px_rgb(198_244_50/0.2)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
        </div>
        <div className="relative flex grow flex-col gap-4">
          <p className="font-display text-lg font-bold">happening</p>
          <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight">
            See what&apos;s on around you, tonight and this week.
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            Gigs, markets, workshops and meetups on a map, filtered by distance, date and price.
          </p>
          <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface px-3.5 py-3">
            <ShieldIcon className="mt-0.5 shrink-0 text-accent-text" />
            <p className="text-sm leading-snug">
              We use your location only to find nearby events. It&apos;s rounded to about 100&nbsp;m and never stored.
            </p>
          </div>
          <div className="mt-auto flex flex-col gap-2.5 pt-6">
            <button
              type="button"
              onClick={locateMe}
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-accent text-base font-semibold text-on-accent"
            >
              <PinIcon /> Use my location
            </button>
            <button type="button" onClick={pickOnMap} className="min-h-[50px] rounded-2xl border border-line font-semibold">
              Pick a spot on the map
            </button>
          </div>
        </div>
      </main>
    );
  }

  const placeLabel = point ? (pointKind === "device" ? "Your location" : "Pinned spot") : "Choose a spot";
  const wider = widerRadius(filters.radiusKm);

  return (
    <main className="relative mx-auto h-dvh max-w-xl overflow-hidden">
      {/* Map fills only the area above the collapsed sheet, so no pin hides behind it. */}
      <div className="absolute inset-x-0 top-0 h-[calc(46dvh+26px)]">
        {mapOn ? (
        <MapView
          center={point ?? KL_CENTER}
          point={point}
          radiusKm={filters.radiusKm}
          events={visible}
          selectedId={selectedId}
          onSelect={selectFromMap}
          onPick={(p) => searchFrom(p, "pin")}
          onCenterChange={(c) => (mapCenter.current = c)}
        />
        ) : null}
      </div>

      <div className="absolute inset-x-4 top-4 z-[1000] flex gap-2">
        <p className="flex min-h-[46px] min-w-0 grow items-center gap-2 rounded-2xl border border-line bg-bg/95 px-4 text-[15px] shadow-md">
          <PinIcon className="shrink-0 text-accent-text" />
          <span className="truncate">
            {placeLabel}
            {point ? ` · ${filters.radiusKm} km` : ""}
          </span>
        </p>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          disabled={!point}
          aria-label="Filters"
          className="flex size-[46px] shrink-0 items-center justify-center rounded-2xl bg-accent text-on-accent shadow-md disabled:opacity-50"
        >
          <FiltersIcon />
        </button>
      </div>

      <section
        aria-labelledby="sheet-title"
        className={`absolute inset-x-0 bottom-0 z-[1000] flex flex-col rounded-t-[26px] border-t border-line bg-bg shadow-[0_-6px_20px_rgba(0,0,0,0.12)] transition-[top] duration-300 ${expanded ? "top-[12dvh]" : "top-[46dvh]"}`}
      >
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          aria-expanded={expanded}
          aria-controls="sheet-body"
          className="flex min-h-11 shrink-0 items-center justify-center"
        >
          <span className="h-1 w-10 rounded-full bg-line" aria-hidden="true" />
          <span className="sr-only">{expanded ? "Show more map" : "Show more of the list"}</span>
        </button>

        <div id="sheet-body" className="min-h-0 grow overflow-y-auto px-5 pb-28">
          <p role="status" aria-live="polite" className="sr-only">
            {status === "locating" ? "Finding your location" : status === "loading" ? "Finding events" : status === "ready" ? `${visible.length} events` : ""}
          </p>

          {status === "locating" || status === "loading" ? (
            <h1 id="sheet-title" className="font-display text-2xl font-bold">
              {status === "locating" ? "Finding your location…" : "Finding events…"}
            </h1>
          ) : null}

          {status === "idle" ? (
            <div className="flex flex-col gap-3">
              <h1 id="sheet-title" className="font-display text-2xl font-bold">Tap the map to choose an area</h1>
              <p className="text-sm text-muted">
                {locError ? LOCATION_MESSAGES[locError] : "Move the map and tap where you want to search from."}
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => searchFrom(roundPoint(mapCenter.current), "pin")}
                  className="flex min-h-[52px] grow items-center justify-center gap-2 rounded-2xl bg-accent px-4 font-semibold text-on-accent"
                >
                  <PlusIcon /> Search this map area
                </button>
                <button type="button" onClick={locateMe} className="min-h-[52px] rounded-2xl border border-line px-4 font-semibold">
                  Use my location
                </button>
              </div>
            </div>
          ) : null}

          {status === "fetch-error" ? (
            <div role="alert" className="flex flex-col gap-3">
              <h1 id="sheet-title" className="font-display text-2xl font-bold">Something went wrong</h1>
              <p className="text-sm text-muted">We couldn&apos;t load events. Check your connection and try again.</p>
              <button
                type="button"
                onClick={() => point && searchFrom(point, pointKind)}
                className="min-h-[52px] rounded-2xl bg-accent font-semibold text-on-accent"
              >
                Try again
              </button>
            </div>
          ) : null}

          {status === "ready" ? (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <h1 id="sheet-title" className="font-display text-2xl font-bold tracking-tight">
                  {visible.length} {visible.length === 1 ? "event" : "events"} nearby
                </h1>
                <button type="button" onClick={() => setFiltersOpen(true)} className="min-h-11 shrink-0 text-sm font-semibold text-accent-text">
                  Filters
                </button>
              </div>
              <p className="text-[13px] text-muted">
                Within {filters.radiusKm} km · {filters.sort === "nearest" ? "nearest first" : "soonest first"} · tap the map to move
              </p>
              <div className="mt-3">
                <SearchBox value={filters.query} onChange={(query) => setFilters((f) => ({ ...f, query }))} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <QuickChip label="Today" pressed={isToday(filters)} onToggle={() => setFilters(toggleToday)} />
                <QuickChip label="Free this week" pressed={isFreeThisWeek(filters)} onToggle={() => setFilters(toggleFreeThisWeek)} />
              </div>

              {events.some((e) => e.title.startsWith("SAMPLE")) ? (
                <p className="mt-3 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold">
                  Sample data: real events coming soon.
                </p>
              ) : null}

              {someDown ? (
                <p className="mt-3 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm font-semibold text-warning">
                  Some sources are unavailable right now.
                </p>
              ) : null}

              {visible.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-line p-6 text-center">
                  <h2 className="text-lg font-semibold">No events match</h2>
                  <p className="mt-1 text-sm text-muted">Try a wider area, fewer filters or a different search.</p>
                  {wider ? (
                    <button
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, radiusKm: wider }))}
                      className="mt-4 min-h-11 rounded-xl bg-accent px-4 font-semibold text-on-accent"
                    >
                      Widen to {wider} km
                    </button>
                  ) : null}
                </div>
              ) : (
                <ul className="mt-2">
                  {visible.map((e) => (
                    <li key={e.id}>
                      <EventRow event={e} selected={e.id === selectedId} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}
        </div>
      </section>

      <TabBar />
      <FilterSheet
        open={filtersOpen}
        filters={filters}
        countFor={(f) => (point ? applyFilters(events, point, f).length : 0)}
        onApply={(f) => {
          setFilters(f);
          setFiltersOpen(false);
        }}
        onClose={() => setFiltersOpen(false)}
      />
    </main>
  );
}
