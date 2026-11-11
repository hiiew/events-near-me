"use client";
// D-05 — FR-02, FR-03, FR-07, FR-32. Leaflet + OpenStreetMap (ADR-03). Browser-only:
// the page loads this with next/dynamic and ssr: false.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { EventWithDistance } from "@/lib/filters";
import { roundPoint, type LatLon } from "@/lib/geo";

export interface MapViewProps {
  center: LatLon;
  point: LatLon | null;
  radiusKm: number;
  events: EventWithDistance[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPick: (p: LatLon) => void;
  onCenterChange: (p: LatLon) => void;
}

// Event titles come from external sources: escape before putting them into marker HTML (T-03).
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Unselected pins are dots (labels overlapped where events cluster); the selected pin shows its name.
const dotIcon = L.divIcon({
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: '<span class="flex size-6 items-center justify-center"><span class="size-3.5 rounded-full bg-ink ring-2 ring-accent"></span></span>',
});

function selectedIcon(title: string) {
  return L.divIcon({
    className: "",
    iconSize: undefined,
    iconAnchor: [12, 14],
    html: `<span class="inline-flex max-w-48 items-center gap-1.5 rounded-full bg-accent py-1 pr-2.5 pl-1.5 text-xs font-semibold whitespace-nowrap text-on-accent shadow-lg"><span class="size-2.5 shrink-0 rounded-full bg-ink"></span><span class="truncate">${escapeHtml(title)}</span></span>`,
  });
}

const pointIcon = L.divIcon({
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: '<span class="block size-[22px] rounded-full bg-accent/25"><span class="m-[5px] block size-3 rounded-full bg-accent ring-3 ring-bg"></span></span>',
});

function MapEvents({ onPick, onCenterChange }: Pick<MapViewProps, "onPick" | "onCenterChange">) {
  const map = useMapEvents({
    click: (e) => onPick(roundPoint({ lat: e.latlng.lat, lon: e.latlng.lng })),
    moveend: () => {
      const c = map.getCenter();
      onCenterChange({ lat: c.lat, lon: c.lng });
    },
  });
  return null;
}

// Fit the whole search circle on screen when the point or radius changes.
function FollowPoint({ point, radiusKm }: { point: LatLon | null; radiusKm: number }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.fitBounds(L.latLng(point.lat, point.lon).toBounds(radiusKm * 2000), { padding: [8, 8] });
  }, [map, point, radiusKm]);
  return null;
}

export default function MapView(props: MapViewProps) {
  const { center, point, radiusKm, events, selectedId, onSelect } = props;
  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={12}
      className="size-full"
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <MapEvents onPick={props.onPick} onCenterChange={props.onCenterChange} />
      <FollowPoint point={point} radiusKm={radiusKm} />
      {point ? (
        <>
          <Circle
            center={[point.lat, point.lon]}
            radius={radiusKm * 1000}
            pathOptions={{ color: "#c6f432", weight: 2, dashArray: "6 6", fillOpacity: 0.05 }}
            interactive={false}
          />
          <Marker position={[point.lat, point.lon]} icon={pointIcon} interactive={false} />
        </>
      ) : null}
      {events.map((e) =>
        e.venue.lat === undefined || e.venue.lon === undefined ? null : (
          <Marker
            key={e.id}
            position={[e.venue.lat, e.venue.lon]}
            icon={e.id === selectedId ? selectedIcon(e.title) : dotIcon}
            zIndexOffset={e.id === selectedId ? 1000 : 0}
            title={e.title}
            alt={e.title}
            eventHandlers={{
              click: () => onSelect(e.id),
              // Leaflet makes pins focusable but doesn't map Enter/Space to click (NFR-05).
              keypress: (k) => {
                if (k.originalEvent.key === "Enter" || k.originalEvent.key === " ") onSelect(e.id);
              },
            }}
          />
        ),
      )}
    </MapContainer>
  );
}
