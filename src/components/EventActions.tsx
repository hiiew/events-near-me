"use client";
// FR-20 save and FR-22 share buttons for the detail page.
import { useState } from "react";
import { toggleBookmark } from "@/lib/bookmarks";
import type { Event } from "@/lib/event-schema";
import { shareData } from "@/lib/links";
import { useBookmarks } from "@/lib/use-bookmarks";
import { BookmarkIcon, ShareIcon } from "./icons";

const iconButton = "flex size-11 items-center justify-center rounded-[14px] border";
const plain = `${iconButton} border-line bg-bg/90`;

export function SaveButton({ event }: { event: Event }) {
  const bookmarks = useBookmarks();
  const saved = bookmarks.some((b) => b.event.id === event.id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Saved — remove from Saved" : "Save event"}
      onClick={() => toggleBookmark(event)}
      className={saved ? `${iconButton} border-accent bg-accent text-on-accent` : plain}
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}

export function ShareButton({ event }: { event: Event }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const data = shareData(event, window.location.href);
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* user closed the share sheet */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked: nothing we can do */
    }
  }

  return (
    <>
      <button type="button" aria-label="Share event" onClick={share} className={plain}>
        <ShareIcon />
      </button>
      <p role="status" aria-live="polite" className={copied ? "fixed top-20 left-1/2 z-[1200] -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-bg" : "sr-only"}>
        {copied ? "Link copied" : ""}
      </p>
    </>
  );
}

