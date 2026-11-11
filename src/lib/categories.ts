// FR-12 / data-model.md §3 — display labels. Night Map uses text tags, not emoji (DC-01).
import { CATEGORY_IDS, type CategoryId } from "./event-schema";

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  music: "Music",
  food: "Food & Markets",
  arts: "Arts & Culture",
  sports: "Sports",
  learning: "Workshops & Learning",
  tech: "Tech & Meetups",
  nightlife: "Nightlife",
  other: "Other",
};

export const CATEGORY_OPTIONS = CATEGORY_IDS.map((id) => ({ id, label: CATEGORY_LABELS[id] }));
