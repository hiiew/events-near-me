// FR-41 (CR-12): "Or browse an area" buttons on the welcome and pick-a-spot screens. Each shows the area's name
// and how many events the visitor will see; the choosing and the counting are in page.tsx and src/lib/areas.ts.
import type { Area } from "@/lib/areas";

function countText(n: number | undefined): string {
  if (n === undefined) return " "; // not loaded (yet, or offline): keep the button height steady
  if (n === 0) return "No events yet";
  return `${n} ${n === 1 ? "event" : "events"}`;
}

export function AreaShortcuts({
  areas,
  counts,
  onPick,
}: {
  areas: readonly Area[];
  counts: Record<string, number | undefined>;
  onPick: (area: Area) => void;
}) {
  return (
    <section aria-labelledby="areas-title">
      <h2 id="areas-title" className="text-[13px] font-semibold tracking-wider text-muted uppercase">
        Or browse an area
      </h2>
      <ul className="mt-2.5 grid grid-cols-2 gap-2.5">
        {areas.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onPick(a)}
              className="flex min-h-[56px] w-full flex-col items-start justify-center rounded-2xl border border-line bg-surface px-4 py-2 text-left"
            >
              <span className="font-semibold">{a.name}</span>
              <span className="text-[13px] text-muted">{countText(counts[a.id])}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[13px] text-muted">Events in the next 30 days, within 50 km of the centre.</p>
    </section>
  );
}
