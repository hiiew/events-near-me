"use client";
// FR-20 — live view of the bookmarks in this browser (updates across tabs too).
import { useMemo, useSyncExternalStore } from "react";
import { parseBookmarks, readRaw, subscribe } from "./bookmarks";

export function useBookmarks() {
  const raw = useSyncExternalStore(subscribe, () => readRaw(), () => "[]");
  return useMemo(() => parseBookmarks(raw), [raw]);
}
