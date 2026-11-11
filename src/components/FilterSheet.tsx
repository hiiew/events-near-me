"use client";
// S-7 — FR-10, FR-11, FR-12, FR-13, FR-06 (sort), NFR-05. Native <dialog> gives focus
// trapping and Escape-to-close for free.
import { useEffect, useRef, useState } from "react";
import { CATEGORY_OPTIONS } from "@/lib/categories";
import type { CategoryId } from "@/lib/event-schema";
import { DEFAULT_FILTERS, RADIUS_OPTIONS, type Filters, type SortBy, type When } from "@/lib/filters";
import { CloseIcon } from "./icons";

const WHEN_OPTIONS: { id: When; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "weekend", label: "This weekend" },
  { id: "7d", label: "Next 7 days" },
  { id: "30d", label: "Next 30 days" },
];
const SORT_OPTIONS: { id: SortBy; label: string }[] = [
  { id: "soonest", label: "Soonest" },
  { id: "nearest", label: "Nearest" },
];

const legend = "mb-2.5 p-0 text-[13px] font-semibold tracking-wider text-muted uppercase";

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 rounded-xl border px-3.5 text-sm font-semibold ${on ? "border-accent bg-accent text-on-accent" : "border-line"}`}
    >
      {children}
    </button>
  );
}

export function FilterSheet({
  open,
  filters,
  countFor,
  onApply,
  onClose,
}: {
  open: boolean;
  filters: Filters;
  countFor: (f: Filters) => number;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setDraft(filters); // start from the filters currently applied
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open, filters]);

  const set = (patch: Partial<Filters>) => setDraft((f) => ({ ...f, ...patch }));
  const toggleCat = (id: CategoryId) =>
    set({ categories: draft.categories.includes(id) ? draft.categories.filter((c) => c !== id) : [...draft.categories, id] });
  const count = countFor(draft);
  const maxValue = draft.price.kind === "max" ? String(draft.price.max) : "";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="filters-title"
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-none rounded-t-[26px] border-t border-line bg-bg p-0 text-ink backdrop:bg-black/60 sm:mx-auto sm:max-w-xl"
    >
      <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 id="filters-title" className="font-display text-2xl font-bold">Filters</h2>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setDraft(DEFAULT_FILTERS)} className="min-h-11 px-2 font-semibold text-accent-text">
              Reset
            </button>
            <button type="button" onClick={onClose} aria-label="Close filters" className="flex size-11 items-center justify-center rounded-xl">
              <CloseIcon />
            </button>
          </div>
        </div>

        <fieldset className="m-0 border-0 p-0">
          <legend className={legend}>Distance (km)</legend>
          <div className="grid grid-cols-5 gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <Chip key={r} on={draft.radiusKm === r} onClick={() => set({ radiusKm: r })}>
                {r}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className={legend}>When</legend>
          <div className="flex flex-wrap gap-2">
            {WHEN_OPTIONS.map((w) => (
              <Chip key={w.id} on={draft.when === w.id} onClick={() => set({ when: w.id })}>
                {w.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className={legend}>Category</legend>
          <div className="flex flex-wrap gap-2">
            <Chip on={draft.categories.length === 0} onClick={() => set({ categories: [] })}>
              All
            </Chip>
            {CATEGORY_OPTIONS.map((c) => (
              <Chip key={c.id} on={draft.categories.includes(c.id)} onClick={() => toggleCat(c.id)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className={legend}>Price</legend>
          <div className="flex flex-wrap items-center gap-2">
            <Chip on={draft.price.kind === "any"} onClick={() => set({ price: { kind: "any" } })}>
              Any
            </Chip>
            <Chip on={draft.price.kind === "free"} onClick={() => set({ price: { kind: "free" } })}>
              Free only
            </Chip>
            <label htmlFor="max-price" className="ml-1 text-sm text-muted">
              Max RM
            </label>
            <input
              id="max-price"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="50"
              value={maxValue}
              onChange={(e) => {
                const n = Number(e.target.value);
                set({ price: e.target.value === "" || n < 0 ? { kind: "any" } : { kind: "max", max: n } });
              }}
              className="min-h-11 w-20 rounded-xl border border-line bg-surface px-3"
            />
          </div>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className={legend}>Sort</legend>
          <div className="flex gap-2">
            {SORT_OPTIONS.map((s) => (
              <Chip key={s.id} on={draft.sort === s.id} onClick={() => set({ sort: s.id })}>
                {s.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => onApply(draft)}
          className="sticky bottom-4 min-h-[54px] rounded-2xl bg-accent text-base font-semibold text-on-accent shadow-[0_0_0_12px_var(--bg)]"
        >
          Show {count} {count === 1 ? "event" : "events"}
        </button>
      </div>
    </dialog>
  );
}
