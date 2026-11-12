// FR-34 (CR-04): one-tap "Free this week" chip above the results list. It only shows and flips the
// state; which filters it sets lives in `toggleFreeThisWeek` in src/lib/filters.ts (and is tested there).
import { CheckIcon } from "./icons";

export function FreeThisWeekChip({ pressed, onToggle }: { pressed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={`flex min-h-11 items-center gap-1.5 rounded-[14px] border px-3.5 text-sm font-semibold ${
        pressed ? "border-accent bg-accent text-on-accent" : "border-line bg-surface"
      }`}
    >
      {/* The check mark means "on" is never shown by colour alone (WCAG 1.4.1, ui-ux.md §4). */}
      {pressed ? <CheckIcon width={16} height={16} /> : null}
      Free this week
    </button>
  );
}
