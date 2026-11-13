// FR-34 (CR-04) "Free this week" and FR-36 (CR-06) "Today": one-tap chips above the results list.
// A chip only shows its label and flips the state; which filters it sets lives in src/lib/filters.ts
// (`toggleFreeThisWeek`, `toggleToday`) and is tested there.
import { CheckIcon } from "./icons";

export function QuickChip({ label, pressed, onToggle }: { label: string; pressed: boolean; onToggle: () => void }) {
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
      {label}
    </button>
  );
}
