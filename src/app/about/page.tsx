// S-6 About & Privacy — FR-31, FR-32, NFR-11 (content: security-privacy.md §5).
import type { Metadata } from "next";
import { ClearSavedData } from "@/components/ClearSavedData";
import { TabBar } from "@/components/TabBar";

export const metadata: Metadata = { title: "About & privacy — Happening" };

const h2 = "font-display text-xl font-bold";

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-5 pt-6 pb-28 leading-relaxed">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">About &amp; privacy</h1>
        <p className="mt-1 text-muted">Happening shows events near you on a map and a list.</p>
      </header>

      <section aria-labelledby="privacy">
        <h2 id="privacy" className={h2}>Your location</h2>
        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5">
          <li>We use your location, or a spot you pick on the map, <strong>only to find events near it</strong>.</li>
          <li>It is <strong>rounded to about 100&nbsp;m</strong> on your phone before it is sent.</li>
          <li>Our server <strong>does not store or log</strong> it.</li>
          <li>You can turn location off in your browser at any time and pick a spot instead.</li>
        </ul>
      </section>

      <section aria-labelledby="device">
        <h2 id="device" className={h2}>What stays on this phone</h2>
        <p className="mt-2">
          Your saved events are kept in this browser only. Nothing about you is stored on our servers — there are no
          accounts.
        </p>
        <ClearSavedData />
      </section>

      <section aria-labelledby="others">
        <h2 id="others" className={h2}>Who else is involved</h2>
        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5">
          <li>
            Map images come from{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline">
              © OpenStreetMap contributors
            </a>
            , which sees your IP address like any website.
          </li>
          <li>Events are curated by Happening from organisers&apos; official pages. Always check the official page before you go.</li>
          <li>Directions open in Google Maps or Waze under their own privacy policies.</li>
        </ul>
      </section>

      <section aria-labelledby="credits">
        <h2 id="credits" className={h2}>Made by</h2>
        <p className="mt-2">
          A TAR UMT student, as a software engineering project.{" "}
          <a href="https://github.com/hiiew/events-near-me" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline">
            Project on GitHub
          </a>
        </p>
      </section>
      <TabBar />
    </main>
  );
}
