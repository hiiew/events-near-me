// D-12 — FR-33: makes Happening installable ("Add to Home Screen"). Next.js serves this at
// /manifest.webmanifest and adds the <link rel="manifest"> tag by itself. Offline use is handled separately by
// the service worker in public/sw.js and the last-search cache (FR-40, CR-10).
import type { MetadataRoute } from "next";

// Night Map dark tokens, docs/03-design/ui-ux.md §4 (--bg). A test keeps this in step with globals.css.
const BACKGROUND = "#0e0f13";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Happening — events near you",
    short_name: "Happening",
    description: "Find gigs, markets, workshops and meetups happening near you.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BACKGROUND, // splash screen while the app opens
    theme_color: BACKGROUND, // browsers that support light/dark theme colours use the ones set in layout.tsx
    lang: "en",
    categories: ["events", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
