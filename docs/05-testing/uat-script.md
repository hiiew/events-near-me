# UAT Script — Happening

| Field | Value |
|---|---|
| Phase | 5 — Testing (user acceptance test) |
| Version | 1.1 — 2026-11-27, owner's decisions recorded (below); 1.0 — first draft |
| Sessions | Wed 23 – Tue 29 Dec 2026 (avoid 24–25 Dec), about 20 minutes each, in person |
| Participants | The owner + 3 classmates, anonymous as **Tester A, B, C**, each on **their own Android phone** |
| Live URL | **`https://________________________`** ← owner fills in (planned `happening-kl.vercel.app`; the Vercel project may be renamed) |
| Test cases | [`test-cases.md`](test-cases.md) **TC-73** (core tasks) and **TC-59** (NFR-04, details within 3 taps); extra evidence for TC-27, TC-35, TC-44, TC-45, TC-48, TC-53, TC-66 |
| Plan | [`test-plan.md`](test-plan.md) — UAT row (§2), device matrix (§3.2), E-6 data criterion (§4), exit criterion 4 (§5), severity scale (§6.1), RT-01/RT-04/RT-05/RT-09 (§8) |
| Results go to | [`test-report.md`](test-report.md), new section **UAT** (§9 of this script says what to copy) |

**Owner decisions (2026-11-27, "agree with all"):**

| # | Question | Decision |
|---|---|---|
| OD-1 | How testers open the app | **QR code** for the live URL on the printed sheet (P-10); no contacts exchanged |
| OD-2 | The owner's own run | Recorded, but **reported separately** from Testers A–C (§2.3, §9); NFR-04 is judged on Testers A–C, with the owner's taps shown beside them |
| OD-3 | Data-check thresholds (§3.1) | As proposed: ≥ 10 Klang Valley events, ≥ 5 in the next 7 days within 10 km of the start point, ≥ 1 free this week, ≥ 1 music this weekend; **postpone** if free, music or a working details page is missing |
| OD-4 | Calendar task T6 | **Optional**; if the phone's calendar app won't open the `.ics`, it is TC-48 evidence about the phone, not a tester failure |
| OD-5 | Remote sessions | **In person only** (no screen sharing: notifications and locations could show) |
| OD-6 | O-1 ("Today" keeps "Free only") | Raise an **S3** issue if **even one** tester answers (b) or (c) |

> **What is UAT?** User acceptance testing: people who did not build the app try to do real
> things with it while you watch. Automated tests prove the app does what the SRS says; UAT shows
> whether real people *can* do it, without help, on their own phones. The script keeps every session
> the same so the four results can be compared.

**How to use this script:** print it (or open it on a laptop). Sections 3 and 4 are read on the day,
section 5 is read aloud word for word, sections 6–7 are the session itself, section 8 is the
recording sheet: print **one copy of §8.1 per participant**.

---

## 1. Purpose and scope

### 1.1 What this UAT proves

| Evidence | Source | Tasks |
|---|---|---|
| **NFR-04** (Must): a new user opens an event's details within **3 taps** after results appear | TC-59 UAT part | T1 |
| **US-01 – US-08** acceptance criteria, done by real users on real phones | TC-73 | T1, T2, T4, T5, T7, T8, T10 (the TC-73 core tasks) |
| US-12, US-14, US-16, US-17, US-19 and the **Change** criterion of US-02 | Extra evidence (not TC-73 pass/fail) | T2, T3, T5, T6, T9 |
| Whether the decision not to build accounts (SRS W-01) suits users | TC-73 feedback question | Questions, §7.2 |
| Whether "Today" keeping "Free only" confuses anyone (observation O-1) | User-manual review | T3, T4 |
| Real Android Chrome versions in use (NFR-13, row D-2) | TC-66 | Set-up, §6.1 |

### 1.2 Which user stories each task covers

| Task | Goal (short) | User stories | Requirements | Test case | Core (TC-73)? |
|---|---|---|---|---|---|
| T1 | Find what's on near a spot you choose; open one | US-01, US-02, US-03, US-05, US-19 | FR-01 – FR-09, FR-17, FR-18, FR-41, **NFR-04** | **TC-59**, TC-73 | Yes |
| T2 | Only free events this week | US-04, US-12 | FR-13, FR-34 | TC-73 (TC-42) | Yes |
| T3 | What's on today | US-14 | FR-36 | TC-44 (manual part) + O-1 | No |
| T4 | A music event this weekend | US-03, US-04 | FR-08, FR-11, FR-12, FR-14 | TC-73 (TC-16, TC-17, TC-19) | Yes |
| T5 | How to get there, by car and by public transport | US-06, US-16 | FR-19, FR-38 | TC-73 (TC-26, TC-27 app part) | Yes |
| T6 | Put it in your calendar with a reminder *(if time)* | US-17 | FR-23, FR-39 | TC-48 | No |
| T7 | Save it and find it again | US-07 | FR-20, FR-21, NFR-11 | TC-73 (TC-28, TC-29) | Yes |
| T8 | Send it to yourself | US-08, US-15 | FR-22, FR-37 | TC-73 (TC-35, TC-45 chat part) | Yes |
| T9 | Search from somewhere else | US-02, US-19 | FR-03, FR-41 | TC-10, TC-53 (manual part) | No |
| T10 | Find out what happens to your location | US-10 | FR-31, NFR-09, NFR-10 | TC-73 (TC-38) | Yes |

### 1.3 What this UAT does **not** prove
- **iOS Safari.** Nobody in the group has an iPhone (owner, 2026-11-27), so iPhone is **out of UAT
  scope**. The partial substitute is the WebKit project in CI (test-plan §3.2 row **D-3a**: Safari's
  engine as an emulated iPhone 15). It does not cover Add to Home Screen, the real iOS location prompt,
  the iOS share sheet, Apple Calendar or VoiceOver, so the **NFR-13 iOS row stays a gap** unless the
  owner accepts it (TC-66).
- **Kota Kinabalu.** Scope is **Klang Valley only** (owner decision, test-plan §1.3). Testers will see
  the Kota Kinabalu button; the facilitator does not ask anyone to use it.
- **Correctness of filters, dates, `.ics` contents, privacy rules, accessibility rules.** Those are
  proven by the automated tests (unit + Playwright + axe). UAT only shows whether people can use them.
- **Performance figures** (NFR-01, NFR-02): measured with tools on ENV-1/ENV-2, not by watching.
- **Statistics.** Four people show problems; they don't measure how common a problem is.

---

## 2. Roles and how to facilitate

| Role | Who | Job |
|---|---|---|
| **Facilitator** | Owner | Reads the script, gives each task, watches, decides when to move on. Doesn't help |
| **Observer / note-taker** | The owner, or a second person if one is free | Fills in §8.1: result, taps, time, what the tester said. With only the owner, write short notes during the task and finish them straight after it |
| **Tester** | Tester A, B or C (and the owner for the owner's own run, §2.3) | Uses their own phone, thinks aloud |

### 2.1 Facilitating without helping
- **Ask for "think aloud":** the tester says what they're looking for, what they expect, what
  surprises them. If they go quiet for ~10 s, prompt neutrally: *"What are you thinking now?"* or
  *"What are you looking for?"*
- **Don't point, don't name buttons,** don't nod or say "nearly" or "yes, that one". Keep your hands
  off their phone.
- **Answer questions with a question:** *"What would you try?"* / *"Where do you think it might be?"*
- **Read the task exactly as written** in §6. Repeating the task wording is fine; rewording it into
  instructions is help.
- **It's the app being tested, not the tester.** If they struggle, say *"That's useful for us, thank you."*

### 2.2 When to intervene, and what counts as help

| Situation | What to do | Record as |
|---|---|---|
| Tester completes the task alone (even slowly, even after wrong turns) | Nothing | **✔ without help** |
| Tester asks how to do it, or is stuck ~1 minute with no progress | First a neutral prompt (*"What would you try next?"*). If still stuck: one hint about **where** to look (*"Have a look at the top of the screen"*) | **H with help** (write the hint in Notes) |
| You named a button, pointed, tapped for them, or the hint gave the answer | — | **H with help** |
| Task reaches its **max time** (§6), or the tester gives up | Say *"Thanks, let's move on"*; set up the next task's start state yourself if needed | **✗ not completed** |
| Tester thinks they're done but the success criteria aren't met | Don't correct them during the task | **✗ not completed** + "thought done" in Notes |
| Something breaks (error page, blank list that shouldn't be blank, crash) | Note the screen and the message, then move on; it's a defect candidate | **✗** + "app fault" in Notes |
| The tester is upset, tired, or wants to stop | Stop at once; thank them. Partial results still count | Note "stopped at Tn" |

### 2.3 The owner's own run
The owner built the app, so the owner is **not a new user**. Run the owner's session first, as a dry
run of the script, ideally with a classmate reading the tasks. TC-59 lists the owner as a participant,
so record the owner's tap count, but report it separately from Testers A–C (§9).

---

## 3. Pre-session checklist (owner, on the day of each session)

Tick every line before the tester arrives. **Any ✗ in the "Stop" column means don't start.**

| # | Check | How | Stop if it fails? |
|---|---|---|---|
| P-1 | **Live URL loads** over `https://` | Open the URL (top of this script) on your own phone | Yes |
| P-2 | **Smoke checks S-7 – S-12 passed today** | `deployment-guide.md` §4: S-7 home page, S-8 location over HTTPS, S-9 **Klang Valley** button, S-10 details page, S-11 shared link in a private tab, S-12 `/about` with **Clear saved data**. Note the date and result in §8.1 | Yes |
| P-3 | **Data check** (next table) | — | See the table |
| P-4 | No "Sample data: real events coming soon." banner in the list | Look at the list after **Klang Valley** | Yes (data not refreshed) |
| P-5 | Your phone and laptop charged; printed §8.1 sheet; timer (phone stopwatch) | — | No |
| P-6 | Tester's phone: **mobile data on** (or Wi-Fi), location (GPS) on if they want to use it, **Chrome up to date** (Play Store → Chrome → Update) | Ask the tester to check at the start; don't take their phone | No (note it) |
| P-7 | Tester's phone: **Do Not Disturb on** for the session | Ask the tester; this keeps personal notifications off the screen | No |
| P-8 | Tester's phone: **no Happening data left** from earlier | If they opened the link before: **About** tab → **Clear saved data** → the line says *"No saved events on this phone."* | No |
| P-9 | **Note the Chrome version** (NFR-13) | Tester opens Chrome **⋮** → **Settings** → **About Chrome**; write the major version (e.g. 143) and the Android version in §8.1. Don't write the phone's name or number | No |
| P-10 | A way to open the URL on the tester's phone without exchanging contacts | QR code on the printed sheet, or the tester types it | No |

### 3.1 Data check (E-6, risk RT-01)
The curated events expire. Do this on **each session day** on your own phone or laptop.

**Test start point:** a public place near where the sessions happen (for example the campus). Keep the
place in your own notes; it doesn't go in the report. This is *not* a tester's location.

| # | Check | How | Need |
|---|---|---|---|
| D-1 | Klang Valley total | Welcome screen → the **Klang Valley** button shows a count (next 30 days, 50 km) | **≥ 10 events** |
| D-2 | Upcoming near the start point | **Pick a spot on the map** → tap the start point → **Filters** → **When: Next 7 days** → read the button **Show N events** (10 km) | **N ≥ 5** |
| D-3 | Free this week | Close the sheet → tap **Free this week** | **≥ 1** event |
| D-4 | Music this weekend | Tap **Free this week** again to turn it off → **Filters** → **This weekend** + **Music** → **Show N events**. "This weekend" for 23 Dec = Sat 26 – Sun 27 Dec; for 28–29 Dec = Sat 2 – Sun 3 Jan | **≥ 1** event |
| D-5 | Today | **Filters** → **Reset** → **Show N events** → tap **Today** | ≥ 1 event; ideally **≥ 1 paid one**, so O-1 (T3) can be seen |
| D-6 | Details page works | Open any event | Not "This event has ended" / "This event isn't available" |
| D-7 | Ideally an event with an image | Open a few events | Nice to have (US-15 preview with image) |

**If the data check fails**
- **D-1, D-4 (music), D-3 (free) or D-6 fails** → the core tasks can't be done. **Postpone** the session
  to another day in the window. Send the owner's late-December event pages to the `events-curator`
  agent (target was 18 Dec), merge, let Vercel deploy, then repeat P-2 (S-7 – S-12) and this data check.
- **D-2 is 1–4** (enough events overall, few near the start point) → you may run the session; write
  "thin data" in §8.1. Testers may need to widen the distance in T1, which is allowed.
- **D-5 has no paid event today** → run anyway; O-1 just can't be seen that day (write "O-1 not visible").
- **If the data can't be refreshed by Tue 29 Dec (M5)**, stop and tell Claude: it moves the Phase 5
  deadline (exit criterion 4), so the owner decides.

---

## 4. Privacy rules for every session (PDPA and the app's own rules)
- **No personal data about testers:** no names, phone numbers, emails, photos, audio or video,
  screenshots, and **nothing about where they are or where they searched**. Only "Tester A / B / C".
- **Don't keep a list of who is A, B or C** anywhere, not even on paper.
- **Testers choose how to search.** If they don't want to share location they use **Pick a spot on the
  map** or an area button. Write only *which way* they used (my location / pick a spot / area), never the place.
- **Don't look at their personal apps.** In T5, T6 and T8 other apps open (Google Maps, calendar, chat).
  The tester says what they see; they can turn the screen away. Never photograph a screen.
- **What is written down:** task result, tap count, time, what they said about the app, the three
  ratings and answers to the questions, Android and Chrome versions. Nothing else.
- **After typing the results into `test-report.md`, shred the paper sheets.**
- **End of session:** offer to clear the app (**About** → **Clear saved data**), delete any calendar
  event they added in T6 and the downloaded `.ics` file, and, if they want, remove the site's location
  permission (Chrome: icon left of the address → **Permissions** → Location; wording varies).

---

## 5. Read aloud at the start (about 2 minutes)

> "Thanks for helping. I'm testing an app I built called Happening. It shows events around Kuala
> Lumpur on a map and a list, like gigs, markets and workshops.
>
> I'm testing the **app, not you**. If something is hard, that's the app's fault, and it's exactly
> what I need to find. There are no wrong answers.
>
> **What I'll write down:** whether each task worked, roughly how many taps and how long it took,
> and what you say about the app. You're **anonymous**: you'll be 'Tester A', 'B' or 'C'. I won't
> write down your name, your phone number, anything personal, or where you are or where you search.
> No photos, no recording.
>
> You'll use **your own phone**. If you'd rather not share your location, there are other ways to
> choose where to search. That's completely fine. Other apps like Maps or a chat app may open; you
> don't have to show me them. Please turn on Do Not Disturb so your notifications stay private.
>
> You can stop at any time, without giving a reason. **Is it OK to go ahead?**"

*(Wait for a clear yes. Tick "Consent: verbal yes" in §8.1. If no, thank them and stop. Nothing is recorded.)*

> "While you use it, please **think aloud**: tell me what you're looking for, what you expect to
> happen, and anything that surprises or annoys you. I'll read you short tasks. I can't help you
> during a task, because I want to see how the app works on its own, but I'll answer everything at
> the end. Just tell me when you think you're done. Ready?"

---

## 6. Tasks (about 12 minutes)

Read the **"Say"** line exactly. The other lines are for the facilitator and observer only.
**Taps** = every deliberate touch that presses something (button, link, chip, row, map pin, tab, the
list handle, a tap on the map), **including wrong taps and Back**. Scrolling, swiping, dragging and
pinch-zoom don't count. Taps are counted for every task, but only **T1's** count is pass/fail (NFR-04);
the "shortest path" is a reference for the observer, not something to tell the tester.

**Start:** the tester opens the URL in **Chrome** (not Samsung Internet or another browser; if they insist,
note which). The **welcome screen** shows *"See what's on around you, tonight and this week."*

### T1 — Something near a spot you choose (NFR-04)
- **Say:** *"Find out what's happening near a place of your choice, then open one event that looks interesting to you."*
- **Start state:** welcome screen, nothing chosen yet.
- **Success (observable):** a results list (*"N events nearby"*) appears, then the tester opens one
  event's details page (event title as the heading, with **Directions (Google Maps)** below).
- **Tap count (NFR-04):** start counting when the results heading *"N events nearby"* first shows;
  stop when the details page shows. Shortest path: event title in the list = **1 tap**; map pin then
  title = 2. **Pass: ≤ 3 taps.** Taps before the list appears (choosing a spot, the location prompt)
  are not counted, but write them down separately.
- **Also note:** which way they chose (**Use my location** / **Pick a spot on the map** / an area button
  such as **Klang Valley**), never the place; whether they tried to tap map pins (pins in central KL are
  small and close together, test-report §2.4 note); whether the location prompt or the denial message
  confused them.
- **If the list is empty:** tapping **Widen to … km** or changing filters is allowed (count the taps).
- **Max time:** 3 minutes.

*(Between tasks: if the tester is on the details page, say "Please go back to the list." Going back is not counted.)*

### T2 — Free this week
- **Say:** *"Money is tight this week. Make the list show only events that are free, happening in the next seven days."*
- **Start state:** Explore screen with the T1 results.
- **Success:** the **Free this week** chip shows on (tick), or in **Filters** the tester set **Free only**
  and **Next 7 days** and tapped **Show N events**; every row's price tag says **FREE**.
- **Shortest path:** 1 tap (chip). Via Filters: about 4.
- **Max time:** 2 minutes.
- **Don't reset anything afterwards:** T3 starts from this state on purpose.

### T3 — What's on today (observation O-1)
- **Say:** *"Now forget the free part. You've got this evening free: see what's on today."*
- **Start state:** as T2 left it (normally **Free this week** on).
- **Success:** the date is Today: the **Today** chip shows on, or **Filters → When: Today** applied.
- **Shortest path:** 1 tap (**Today**). Known behaviour (FR-36): **Today** changes only the date, so
  **Free only stays on** and paid events today are still hidden, while the **Free this week** chip
  turns off. To clear the price the tester must open **Filters** and choose **Price: Any**.
- **Observation O-1 (don't ask leading questions):** when the tester says they're done, ask only:
  *"Tell me what the list is showing you now."* Write down, close to their words, whether they
  (a) know it's still free-only, (b) think it's all of today's events, or (c) are confused. Note if
  they open Filters and find **Free only** themselves. Don't explain the behaviour until the end of the session.
- **Max time:** 1½ minutes.

### T4 — Music this weekend
- **Say:** *"You fancy live music. Find a music event happening this weekend."*
- **Start state:** as T3 left it (don't reset; note whether **Free only** is still on).
- **Success:** **Music** and **This weekend** applied (**Filters** → **This weekend** + **Music** → **Show N events**);
  every row's category tag says **Music**, dated Saturday or Sunday. If **Free only** is still on and
  the list is empty or short, the task still counts as done if Music + This weekend are set; record
  under O-1 whether they noticed why.
- **Shortest path:** about 4 taps (**Filters**, **This weekend**, **Music**, **Show N events**).
- **Max time:** 2½ minutes.
- **Before T5:** if the list is empty, the facilitator (not the tester) opens **Filters** → **Reset** →
  **Show N events**, and says *"Here's a list to carry on with."* This is set-up, not help.

### T5 — Getting there, by car and by public transport
- **Say:** *"Pick one of these events. Find out how to get there, first by car, then by LRT, MRT or bus."*
- **Start state:** results list with at least one event.
- **Success:** from the details page the tester opens **Directions (Google Maps)** and Google Maps shows
  the venue as the destination; then, back in Happening, opens **By public transport** and Maps shows the
  public-transport mode. Waze (**Open in Waze instead**) counts for the car part too. The tester tells you
  what Maps shows; you don't need to see their Maps app.
- **Shortest path:** title 1 + **Directions** 1; back to Chrome; **By public transport** 1.
- **Note:** whether returning from Google Maps to Happening was easy (Android Back or app switcher), and whether the page was still there.
- **Max time:** 2 minutes.

### T6 — Calendar reminder *(if time: skip when the session is past 14 minutes)*
- **Say:** *"Put this event in your phone's calendar so you get a reminder. You can cancel before it's actually saved."*
- **Start state:** the T5 details page.
- **Success:** **Add to calendar** downloads a file, and a calendar app on the phone opens it showing the
  event (title, time) and, if the tester can see it, the reminders (a day before and an hour before).
- **Note:** what happened after the download, in the tester's words (which app opened, "no app can open
  this file", where the file went). On Android this depends on the phone's calendar app; it's evidence
  for **TC-48**, not a tester failure. The tester may cancel; if they saved it, remind them to delete it at the end.
- **Shortest path:** 1 tap + opening the downloaded file (1–2).
- **Max time:** 2 minutes.

### T7 — Save it and find it again
- **Say:** *"You might go to this one. Keep it in the app so you can find it again later, then show me where you'd find it."*
- **Start state:** a details page (the T5 event is fine).
- **Success:** the bookmark button turns lime (saved), and the tester reaches the **Saved** tab where the
  event is listed. *(Optional if quick: close Chrome fully, reopen the URL, **Saved**: still there, TC-29.)*
- **Shortest path:** bookmark 1, Back 1, **Saved** tab 1 (3).
- **Max time:** 1½ minutes.

### T8 — Send it to yourself
- **Say:** *"Send this event to yourself, for example in a chat with yourself or a note, as if you were going to send it to a friend."*
- **Start state:** the saved event's details page (open it from **Saved**).
- **Success:** the share button opens Android's share menu showing the event. Sending it is optional. If
  they send it to themselves, ask *"What does the message show?"* and note whether the preview has the
  event title, date/venue/price and a picture (FR-37). The tester shows or tells you only that message.
- **Shortest path:** 1 tap (share icon, top right).
- **Max time:** 1½ minutes.

### T9 — Search from somewhere else
- **Say:** *"You're meeting friends somewhere else in the Klang Valley later. Change where the app is searching from."*
- **Start state:** Explore tab with results (tap **Explore** if needed; this tap isn't counted).
- **Success:** the bar at the top shows the new place (*"Pinned spot · 10 km"* or *"Klang Valley · 50 km"*)
  and the list changes. Any route counts: **Change** → **Search this map area** / tap the map / **Klang
  Valley** / **Use my location**, or tapping the map straight from the results.
- **Note:** don't write down where they moved to. Note if they found **Change**, and if choosing **Klang
  Valley** resetting their filters surprised them.
- **Max time:** 1½ minutes.

### T10 — What happens to your location
- **Say:** *"Before you'd use this for real, you want to know what the app does with your location. Find out, and tell me in your own words."*
- **Start state:** any screen.
- **Success:** the tester opens **About** (heading *"About & privacy"*, section *"Your location"*) and says,
  in their words, at least two of: it's used only to find events; it's rounded to about 100 m; it isn't
  stored or logged. (The welcome-screen line *"We use your location only to find nearby events…"* also counts if they quote it correctly.)
- **Shortest path:** 1 tap (**About** tab).
- **Max time:** 1½ minutes.

---

## 7. Questions after the tasks (about 4 minutes)

### 7.1 Three ratings (1–5; read the anchors; not pass/fail)

| # | Question (read aloud) | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| R-1 **Ease** | *"Overall, how easy was Happening to use?"* | Very hard | Quite hard | OK | Quite easy | Very easy |
| R-2 **Usefulness** | *"How useful would Happening be for finding things to do around KL?"* | Not useful at all | Not very useful | Somewhat useful | Useful | Very useful |
| R-3 **Would use** | *"How likely are you to use Happening again, on your own?"* | Definitely not | Probably not | Not sure | Probably | Definitely |

After each score ask *"Why that number?"* and note the reason. A score of 1 or 2 with a concrete reason becomes an issue (§9).

### 7.2 Device-sync feedback question (TC-73, read exactly)
> *"Saved events stay on this phone only. Would you want them on more than one device, e.g. your phone and laptop? Yes / No / Don't mind — why?"*

Record the answer **and the reason**. Don't argue for or against accounts.

### 7.3 Open questions
1. *"Was anything confusing, slow or annoying? Where?"*
2. *"Was anything hard to read or hard to tap?"* (accessibility: small text, contrast in sunlight, small map dots, dark/light theme)
3. *"What's missing that would make you use it more?"*

**Then (session over):** explain O-1 if it came up, answer their questions, do the end-of-session
privacy steps (§4), thank them.

---

## 8. Recording

### 8.1 Per-participant sheet (print one per participant)

**Participant:** ☐ Owner ☐ Tester A ☐ Tester B ☐ Tester C  **Date:** ____ Dec 2026  **Consent: verbal yes** ☐
**Android version:** ____ **Chrome version (major):** ____ **Browser if not Chrome:** ____
**Smoke S-7 – S-12 today:** ☐ passed **Data check D-1 – D-6:** ☐ passed ☐ thin data ☐ O-1 not visible
**T1 way of searching:** ☐ Use my location ☐ Pick a spot on the map ☐ Area button ☐ other: ____ *(never the place)*

| Task | Result: ✔ without help / H with help / ✗ not completed / – skipped | Taps | Time (m:ss) | Notes (what they said, where they hesitated, hints given) |
|---|---|---|---|---|
| T1 near a spot → details | | ___ after list (**pass ≤ 3**) · ___ before list | | |
| T2 free this week | | | | |
| T3 today | | | | **O-1:** ☐ (a) knows still free-only ☐ (b) thinks all of today ☐ (c) confused ☐ found Free only in Filters |
| T4 music this weekend | | | | Free only still on? ☐ yes ☐ no — noticed? ☐ |
| T5 directions car + transit | | | | Car ☐ Transit ☐ Back to app easy? |
| T6 calendar *(if time)* | | | | What opened: |
| T7 save + find again | | | | Survived reopen? ☐ not tried |
| T8 send to self | | | | Share menu ☐ · Preview: title ☐ details ☐ picture ☐ not sent ☐ |
| T9 search from elsewhere | | | | Used **Change**? ☐ |
| T10 location privacy | | | | Points said: only to search ☐ rounded ☐ not stored ☐ |

| Question | Answer | Reason / notes |
|---|---|---|
| R-1 Ease (1–5) | | |
| R-2 Usefulness (1–5) | | |
| R-3 Would use (1–5) | | |
| Saved events on more than one device? | ☐ Yes ☐ No ☐ Don't mind | |
| Confusing / slow / annoying | | |
| Hard to read or tap | | |
| Missing | | |
| Other observations (errors, messages seen) | | |

### 8.2 Summary table (for `test-report.md` §UAT)

| Item | Owner | A | B | C | Result |
|---|---|---|---|---|---|
| T1 result / taps after list | | | | | NFR-04: A–C ≤ 3 taps? (owner shown, not counted, OD-2) |
| T2 free this week | | | | | |
| T3 today | | | | | (extra, US-14) |
| T4 music this weekend | | | | | |
| T5 directions car + transit | | | | | |
| T6 calendar | | | | | (extra, TC-48) |
| T7 save + find again | | | | | |
| T8 send to self | | | | | |
| T9 search from elsewhere | | | | | (extra, US-02/US-19) |
| T10 location privacy | | | | | |
| **TC-73 core tasks all ✔ without help?** (T1, T2, T4, T5, T7, T8, T10) | | | | | **Pass / Fail** |
| O-1 (a / b / c) | | | | | count of (b) + (c) |
| R-1 / R-2 / R-3 | | | | | median of A–C (owner shown apart) |
| Device-sync: Yes / No / Don't mind | | | | | tally + main reasons |
| Android / Chrome major | | | | | NFR-13 D-2: latest and previous major seen? |
| Issues raised | | | | | DEF-xx / backlog ids |

---

## 9. How results flow

1. **Type up** each sheet into `test-report.md` in a new **UAT** section (summary table §8.2, then the
   issues); shred the paper (§4). Testers are only ever "Tester A/B/C"; the owner's run is shown in its
   own column, because the owner isn't a new user.
2. **Each issue is sorted** (with Claude's help, `qa-engineer`):
   - **Defect** = the app doesn't do what the SRS says, breaks, or fails WCAG AA. Give it the next free
     **DEF-xx** in `test-report.md` §3 with the **severity from test-plan §6.1**:
     **S1 Critical** (Must fails with no workaround, or a privacy/security breach) · **S2 High** (Must fails
     with a workaround, a Should fails, or an accessibility failure blocks a core flow) · **S3 Medium**
     (a Could feature fails, or something works but confuses users or differs from the SRS) · **S4 Low**
     (cosmetic). Steps to reproduce, device (Android + Chrome version), expected, actual. Fixes go to the
     `developer` agent, one branch per fix; S1/S2 must be fixed before M5.
   - **Not a defect** (works as specified, but users want something different, or a new idea) → a
     **backlog** item with the owner's decision, listed in the UAT section and handed to the
     `maintenance-engineer` (Phase 7). If it changes a requirement it needs a change request in
     `docs/02-requirements/change-log.md` first.
3. **NFR-04 / TC-59 (UAT part):** **pass** only if **every new user (Tester A, B, C)** opened
   an event's details in **≤ 3 taps** after the results appeared in T1 (TC-59 expected result). The
   owner's taps are reported beside them but don't decide it: NFR-04 is about *new* users (OD-2). One
   tester over 3 taps = fail: record a defect (S2: Must fails, with a workaround) and look at what
   caused the extra taps.
4. **TC-73:** **pass** only if **every participant completed every core task (T1, T2, T4, T5, T7, T8, T10)
   without help** and NFR-04 passed (TC-73 expected result). Any **H** or **✗** on a core task = TC-73 fails
   for now; the cause becomes a defect or a backlog item, and the task is re-checked after a fix. Tasks
   marked "– skipped" because the data lacked them don't pass; report them as a gap (data, RT-01).
   T3, T6 and T9 don't decide TC-73: their results are extra evidence for TC-44, TC-48, TC-10/TC-53.
5. **Device-sync question:** not pass/fail. If **most testers say Yes with a real reason**, raise a change
   request for Phase 7 and consider a lighter option than full accounts first (e.g. a "send my saved list
   to myself" link); otherwise W-01 (no login) stands (TC-73).
6. **O-1 (Today keeps Free only):** if **any tester** answered (b) or (c), raise it as an **S3** issue for
   the owner to decide (keep FR-36 as written and make the kept price filter visible, or change FR-36 by a
   change request). If everyone answered (a), note "no confusion seen" and close it.
7. **Ratings:** report each score with its reason and the median of Testers A–C; there is no pass mark.
8. **NFR-13:** add the Android and Chrome versions seen to TC-66 row D-2. If no one has the previous
   Chrome major, D-2's "previous major" stays a gap; the iOS row (D-3) stays a gap (§1.3).
9. **Traceability matrix:** NFR-04 turns ✅ only when the TC-59 UAT part passes (its e2e part already passed);
   US-level ✅ follow TC-73. Exit criterion 4 (test-plan §5) is met when the UAT is done and NFR-04 passed.
