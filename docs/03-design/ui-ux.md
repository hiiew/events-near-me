# UI / UX Design — Happening

| Field | Value |
|---|---|
| Phase | 3 — Design |
| Version | 1.0 (draft for approval) |
| Date | 2026-11-11 |
| Style | **Playful campus**: bright colours, rounded cards, emoji category icons |

> **What's in a UI/UX design doc?** *UX* (user experience) is how the app flows — what the user does
> step by step. *UI* (user interface) is how each screen looks. Standard artefacts: **user flows**
> (diagrams of paths through the app), **wireframes** (low-detail screen sketches), and a **style
> guide** (colours, type, components). Design **mobile-first**: sketch the small screen, then
> stretch it.

## 1. Navigation and screens

| ID | Screen | Purpose | Requirements |
|---|---|---|---|
| S-1 | Welcome / location prompt | Explain why location is needed, then ask | FR-01, US-10 |
| S-2 | Explore — List | Results list + filter bar | FR-04–06, FR-10–15 |
| S-3 | Explore — Map | Markers, pin dropping, summary card | FR-02, FR-03, FR-07, FR-09 |
| S-4 | Event detail | All details + actions | FR-17–20, FR-22 |
| S-5 | Saved | Bookmarked events | FR-20, FR-21 |
| S-6 | About & Privacy | Privacy notice, attribution, clear data | FR-31, FR-32, NFR-11 |
| S-7 | Filter sheet | Distance, date, category, price, sort | FR-10–14 |

Bottom tab bar (thumb-friendly): **🔍 Explore · 🔖 Saved · ℹ️ About**. List/Map is a toggle inside Explore.

## 2. User flows

### Flow A — First visit (FR-01, FR-02)

```mermaid
flowchart TD
    A([Open Happening]) --> B[S-1 Welcome: 'We use your location only to find nearby events. It isn't stored.']
    B --> C{Tap 'Use my location'}
    C --> D[Browser permission prompt]
    D -->|Allow| E[Get position ≤ 10 s]
    D -->|Deny| G
    E -->|Success| F[Round to 3 dp → search]
    E -->|Timeout / error| G[S-3 Map: 'Tap the map to choose an area']
    B -->|'Pick on map instead'| G
    G -->|Tap map| H[Drop pin → search]
    F --> I[S-2 List: events ≤ 10 km, soonest first]
    H --> I
```

### Flow B — Find, filter, act (FR-10–22)

```mermaid
flowchart LR
    L[S-2 List] -->|Filters button| F[S-7 Filter sheet]
    F -->|Apply| L
    L -->|Toggle| M[S-3 Map]
    M -->|Tap marker| C[Summary card]
    C -->|View details| D[S-4 Detail]
    L -->|Tap card| D
    D -->|View official page| X[(Source site, new tab)]
    D -->|Directions| G[(Google Maps / Waze)]
    D -->|Save| S[S-5 Saved]
    D -->|Share| SH[(Share sheet / copy link)]
```

## 3. Wireframes (360 px wide, low-fidelity)

### S-1 Welcome
```
┌────────────────────────────────┐
│            🎉                  │
│         Happening              │
│  Find what's on near you —     │
│  gigs, markets, workshops,     │
│  meetups & more.               │
│                                │
│  📍 We use your location only  │
│  to find nearby events. It's   │
│  rounded and never stored.     │
│                                │
│ ┌────────────────────────────┐ │
│ │   📍 Use my location       │ │  ← primary button (≥44 px tall)
│ └────────────────────────────┘ │
│     Pick a spot on the map     │  ← secondary text button
│                                │
│      Privacy · About           │
└────────────────────────────────┘
```

### S-2 Explore — List
```
┌────────────────────────────────┐
│ 🎉 Happening        [List|Map] │
│ 📍 Near you · 10 km  ✏️ change │
│ ┌──────┐┌────────┐┌─────────┐  │
│ │Next30d││All cats││⚙ Filters│ │  ← chips (scroll sideways)
│ └──────┘└────────┘└─────────┘  │
│ 23 events · Sort: Soonest ▾    │
│ ┌────────────────────────────┐ │
│ │ [img]  🎵 MUSIC            │ │
│ │ Indie Night at …           │ │
│ │ Fri 4 Dec · 8:00 PM        │ │
│ │ 📍 Venue name · 2.4 km     │ │
│ │ RM 35.00            🔖     │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ [img]  🍜 FOOD & MARKETS   │ │
│ │ Weekend Craft Market       │ │
│ │ Sat 5 Dec · 10:00 AM       │ │
│ │ 📍 Venue · 4.1 km    FREE  │ │
│ └────────────────────────────┘ │
│ ⚠ Some sources are unavailable │  ← only when FR-28 applies
├────────────────────────────────┤
│  🔍 Explore   🔖 Saved  ℹ️ About │
└────────────────────────────────┘
```

### S-3 Explore — Map
```
┌────────────────────────────────┐
│ 🎉 Happening        [List|Map] │
│ ┌────────────────────────────┐ │
│ │        🎵      🍜           │ │
│ │   ⚽        📍(you/pin)     │ │
│ │        🎨          💻       │ │
│ │  (tap anywhere to move pin)│ │
│ │ ┌────────────────────────┐ │ │
│ │ │ 🍜 Weekend Craft Market│ │ │  ← summary card on marker tap
│ │ │ Sat 5 Dec · FREE       │ │ │
│ │ │ [ View details → ]     │ │ │
│ │ └────────────────────────┘ │ │
│ └──────────── © OpenStreetMap┘ │
│ 3 events not shown on map (no  │
│ location) — see list           │  ← FR-09
├────────────────────────────────┤
│  🔍 Explore   🔖 Saved  ℹ️ About │
└────────────────────────────────┘
```

### S-4 Event detail
```
┌────────────────────────────────┐
│ ← Back                  🔖  ↗  │  ← save, share
│ ┌────────────────────────────┐ │
│ │          [image]           │ │
│ └────────────────────────────┘ │
│ 🍜 FOOD & MARKETS              │
│ Weekend Craft Market           │
│ 🗓 Sat 5 Dec 2026              │
│    10:00 AM – 6:00 PM (MYT)    │
│ 📍 Venue name                  │
│    Full address · 4.1 km       │
│ 💸 Free                        │
│ About this event               │
│ Lorem description text …       │
│                                │
│ ┌────────────────────────────┐ │
│ │ 🧭 Directions (Google Maps)│ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ 🎟 View official page  ↗   │ │
│ └────────────────────────────┘ │
│      Open in Waze instead      │
│ Source: Curated by Happening   │
└────────────────────────────────┘
```

### S-5 Saved
```
┌────────────────────────────────┐
│ 🔖 Saved (3)                   │
│ ┌────────────────────────────┐ │
│ │ 🎵 Indie Night at …   🔖   │ │
│ │ Fri 4 Dec · RM 35.00       │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ 🎨 Art Exhibition   ENDED  │ │  ← FR-21, greyed out
│ └────────────────────────────┘ │
│ Empty state: "Nothing saved    │
│ yet — tap 🔖 on any event."    │
├────────────────────────────────┤
│  🔍 Explore   🔖 Saved  ℹ️ About │
└────────────────────────────────┘
```

### S-7 Filter sheet (slides up from bottom)
```
┌────────────────────────────────┐
│ Filters                 Reset  │
│ Distance                       │
│ (2) (5) [10] (25) (50) km      │
│ When                           │
│ (Today) (This weekend)         │
│ (Next 7 days) [Next 30 days]   │
│ Category                       │
│ [🎵 Music] [🍜 Food] [🎨 Arts]  │
│ [⚽ Sports] [📚 Learning]       │
│ [💻 Tech] [🌙 Nightlife] [✨]   │
│ Price                          │
│ [All] (Free only) (Max RM __)  │
│ Sort: (Soonest) (Nearest)      │
│ ┌────────────────────────────┐ │
│ │      Show 23 events        │ │  ← live count
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

## 4. Style guide — "playful campus"

### Colour tokens

Bright colours are used for **backgrounds, chips and icons**; text always uses high-contrast
colours so we meet **WCAG 2.1 AA** (NFR-05). Contrast ratios below are calculated against the
stated background **[re-check with a contrast tool in Phase 5]**.

| Token | Light mode | Dark mode | Use | Contrast note |
|---|---|---|---|---|
| `--bg` | `#FFFBF5` (warm white) | `#17132B` (deep indigo) | Page background | — |
| `--surface` | `#FFFFFF` | `#231D3F` | Cards, sheets | — |
| `--text` | `#1E1B2E` | `#F5F3FF` | Body text | ≥ 15:1 |
| `--text-muted` | `#5B5670` | `#C4BFDB` | Secondary text | ≥ 6:1 |
| `--primary` | `#6D28D9` (violet) | `#A78BFA` | Buttons, links, active tab | white on `#6D28D9` ≈ 7.1:1 ✅; `#17132B` on `#A78BFA` ≈ 6.6:1 ✅ (dark mode) |
| `--accent-1` | `#FF6B6B` (coral) | same | Decorative blobs, badges with dark text | not for text on white |
| `--accent-2` | `#FFD43B` (sunny yellow) | same | "FREE" badge (dark text on yellow) | dark text on yellow ≈ 11.8:1 ✅ |
| `--accent-3` | `#20C997` (mint) | same | Success, "Saved" toast (dark text) | |
| `--warning` | `#B45309` | `#FBBF24` | "Some sources unavailable" | 4.9:1 on `--bg` ✅; 10.8:1 dark ✅ |

Category chips use a **light tint background + dark text + emoji**, so colour is never the only
signal (WCAG 1.4.1).

### Typography
- Font: **Nunito** (rounded, friendly; free via `next/font/google`), fallback `system-ui`.
- Sizes: body 16 px (never smaller than 14 px), card title 18 px bold, screen title 24 px extra-bold.

### Shapes and motion
- Cards and buttons: border-radius **16 px**; chips fully rounded.
- Soft shadows; small "pop" animation when bookmarking.
- All animation disabled when the user's system has **reduced motion** turned on.

### Dark mode
Follows the phone's setting (`prefers-color-scheme`); tokens above swap automatically.

## 5. Content and formatting rules (NFR-18)

| Item | Format | Example |
|---|---|---|
| Date | `EEE d MMM` (+ year if not this year) | Sat 5 Dec |
| Time | 12-hour, Malaysia time | 8:00 PM |
| Price | `RM 0.00`; free → `FREE` badge; null → "Price not listed" | RM 35.00 |
| Price range | `RM min – RM max` | RM 20.00 – RM 80.00 |
| Non-MYR | Original currency, no conversion | USD 15.00 |
| Distance | 1 decimal km | 2.4 km |

## 6. Accessibility checklist (NFR-05)

- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for large text and icons)
- [ ] Tap targets ≥ 44 × 44 px
- [ ] Every control reachable by keyboard with a visible focus ring
- [ ] Images have `alt` text (event title); decorative emoji hidden from screen readers or labelled
- [ ] Map markers also available as the list (map is never the only way to reach an event)
- [ ] Status messages (results count, "Link copied", errors) announced with `aria-live`
- [ ] Page zoom to 200 % without loss of content
- [ ] Reduced-motion respected
- [ ] Semantic headings (`h1` per screen) and landmarks (`nav`, `main`)

## 7. Directions behaviour (FR-19, decided Phase 3)
Primary button opens **Google Maps** (works on phone and desktop). A smaller "Open in Waze
instead" link sits underneath. The user's last choice is remembered in `happening.prefs.v1`.
