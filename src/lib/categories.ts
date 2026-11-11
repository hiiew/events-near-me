// FR-12 / data-model.md §3 — display label and emoji for each category.
import type { CategoryId } from "./event-schema";

export const CATEGORY_META: Record<CategoryId, { label: string; emoji: string }> = {
  music: { label: "Music", emoji: "🎵" },
  food: { label: "Food & Markets", emoji: "🍜" },
  arts: { label: "Arts & Culture", emoji: "🎨" },
  sports: { label: "Sports", emoji: "⚽" },
  learning: { label: "Workshops & Learning", emoji: "📚" },
  tech: { label: "Tech & Meetups", emoji: "💻" },
  nightlife: { label: "Nightlife", emoji: "🌙" },
  other: { label: "Other", emoji: "✨" },
};
