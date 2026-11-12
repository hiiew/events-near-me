"use client";
// FR-40 (CR-10): registers /sw.js (the offline app shell) in production builds only, so `next dev`
// hot reload never meets a cached page. Renders nothing.
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        // Hand over the files this visit already loaded, so they work offline after the very first visit.
        const urls = performance
          .getEntriesByType("resource")
          .map((entry) => new URL(entry.name))
          .filter((url) => url.origin === location.origin && (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")))
          .map((url) => url.pathname + url.search);
        registration.active?.postMessage({ type: "cache-urls", urls });
      })
      .catch(() => {
        /* no service worker (private mode, blocked): the app works the same, just not offline */
      });
  }, []);
  return null;
}
