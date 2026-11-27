# Happening — user manual

| | |
|---|---|
| For | Anyone using Happening on a phone, including the UAT testers (23–29 Dec 2026) |
| App address | `https://happening-kl.vercel.app` — **planned address, not live yet** (see the [deployment guide](deployment-guide.md)). The owner will send you the final link before testing starts. |
| Version | Draft, 2026-11-27 (Phase 6). Button names match the app as built. |

---

## 1. What Happening is

Happening shows events near you (gigs, markets, workshops, meetups and more) on a map and a list
on the same screen. You can narrow them down by distance, date, category and price, open an event
to see the details, get directions, add it to your calendar, save it or share it with friends.
It runs in your phone's web browser and you can add it to your home screen like an app.

**What it doesn't do**

- **No accounts.** There is nothing to sign up for or log in to.
- **No ticket buying.** To book or buy, tap **View official page** and use the organiser's site.
- **No notifications.** The only reminders are the ones your own calendar app shows after you use
  **Add to calendar**.
- **Klang Valley and Kota Kinabalu only.** Other places will show few or no events.
- **A hand-picked list.** Events come from a list curated from organisers' official pages, so it
  won't show everything that's on.
- **English only.**

## 2. Opening the app and adding it to your home screen

Open the app address in **Chrome** (Android) or **Safari** (iPhone). Use the `https://` address:
your phone only shares its location with secure sites.

To add it to your home screen (menu names vary a little between phone and browser versions, so
treat these as approximate):

- **Android, Chrome:** tap the **⋮** menu (top right), then **Install app** or **Add to Home screen**.
- **iPhone, Safari:** tap the **Share** button (square with an arrow), scroll down, then
  **Add to Home Screen**, then **Add**.

The icon is called **Happening**. It opens full screen, without the browser's address bar.

The app has three tabs at the bottom: **Explore** (map and list), **Saved** and **About**.

## 3. Finding events

The first screen says *"See what's on around you, tonight and this week."* You have three ways in.

### Use my location

Tap **Use my location**. Your browser then shows its own pop-up asking whether this site may use
your location. Tap **Allow** (the exact wording depends on your phone). Happening uses it only to
find events near you: it rounds it to about 100 m first and never stores it (see section 9).

If you say no, or finding you takes too long, the app tells you so (for example *"Location is off,
so pick where to search from."*) and lets you pick a spot instead. Nothing breaks.

### Pick a spot on the map

Tap **Pick a spot on the map**. Move the map to the place you're interested in, then either
**tap the map** at that spot, or tap **Search this map area** to search from the middle of what you
can see.

### Or browse an area

Under **Or browse an area** there is a button for **Klang Valley** and one for **Kota Kinabalu**,
each with the number of events it has ("No events yet" if none). Tapping one searches from the
centre of that area, up to 50 km away, over the next 30 days. Your own location isn't used at all.
Choosing an area puts every filter back to normal (and clears the search box), so the list matches
the number on the button. With no signal the buttons still work but show no number.

### Changing where you search from

At the top of the Explore screen a bar shows where you're searching from (*Your location*,
*Pinned spot* or the area name) and the distance, for example *"Pinned spot · 10 km"*. Tap
**Change** on that bar to choose again: **Search this map area**, **Use my location** or an area.
Your filters stay as they were. To leave without changing anything, tap
**Cancel, back to results**.

Shortcut: on the results screen, **tapping anywhere on the map** searches from that spot straight
away (the list says *"tap the map to move"*).

## 4. Reading the results

The **map** is at the top and the **list** slides up from the bottom. The heading tells you how
many events there are, for example *"12 events nearby"*, with the distance and order underneath
(*"Within 10 km · soonest first"*).

- **Make the list bigger:** tap the small handle at the top of the list. Tap it again to see more map.
- **The map:** the lime dot is where you're searching from and the dashed circle is your distance.
  Each event is a dot. **Tap a dot** to highlight that event in the list; its name then shows on
  the map.
- **Each row** shows the date, title, time, venue and distance, a price tag (**FREE** in lime, an
  amount like *RM 35.00*, or *Price not listed*) and a category. Tap the **title** to open the
  event. The arrow button on the right opens the organiser's official page.
- A row that says **"not on map"** is an event whose venue location we don't know, so it has no
  dot and no distance.
- **Order:** soonest first, unless you choose **Nearest** in Filters.
- **No events?** You'll see **No events match** and, where possible, a **Widen to … km** button
  that makes the distance one step bigger.
- *"Some sources are unavailable right now."* means part of the event data couldn't be reached;
  what you see is still correct but may be incomplete.

## 5. Narrowing the results

All of these change the list and the map together, straight away.

- **Search box** (*"Search events or places"*): type a word from the event's name, the venue, the
  address or the category. Capitals and accents don't matter ("cafe" finds "Café"). If you type
  several words, events must match all of them.
- **Today:** only events still on today (Malaysia time). Tap again to turn it off.
- **Free this week:** only free events in the next 7 days. Tap again to turn it off.
- **Only one of Today and Free this week can be on at a time**, because both change the date.
  A tick shows which one is on.

### The Filters sheet

Tap **Filters** (the lime button at the top right, or the word **Filters** beside the heading).
A sheet slides up with:

| Section | Choices |
|---|---|
| Distance (km) | 2, 5, 10 (normal), 25, 50 |
| When | Today, This weekend, Next 7 days, Next 30 days (normal) |
| Category | All, or one or more of: Music, Food & Markets, Arts & Culture, Sports, Workshops & Learning, Tech & Meetups, Nightlife, Other |
| Price | Any, Free only, or type a top price in **Max RM** |
| Sort | Soonest, Nearest |

The big button at the bottom shows how many events you'll get, for example **Show 8 events**. Tap
it to apply. Tap the **X** (or swipe back / press Escape) to close without changing anything.
**Reset** puts the choices in the sheet back to normal but keeps what you typed in the search box.

Note: **Free only** and **Max RM** hide events whose price isn't listed. Choose **Any** to see them.

## 6. An event's page

Tap an event's title to open its page. It shows the category, title, picture (if there is one),
day and time (*Malaysia time*), venue and address, how far it is from your search, the price, the
description and where the information came from (*"Source: …"*).

| Button | What it does |
|---|---|
| **Directions (Google Maps)** | Opens Google Maps with the venue as the destination |
| **By public transport** | Opens Google Maps in public-transport mode (LRT, MRT, bus) |
| **Open in Waze instead** | Opens the venue in Waze |
| **Add to calendar** | Downloads a calendar file. Open it and your calendar app offers to add the event with **two reminders: one a day before and one an hour before** (any that have already passed are left out) |
| **View official page** | Opens the organiser's page: check details and buy tickets there |
| **Share** (icon, top right) | Opens your phone's share menu. On a computer it copies the link and says *"Link copied"*. In chat apps the link shows the event title, date, venue and price |
| **Save** (bookmark icon, top right) | Adds the event to **Saved**. It turns lime when saved; tap again to remove |

The back arrow (top left) returns you to Explore, with your results and filters as you left them.

On iPhone, the calendar file may open a preview first: tap **Add All** or similar (approximate).

## 7. Saved events

The **Saved** tab lists the events you bookmarked, with the date, venue and price.

- They are kept **on this phone, in this browser only**. They don't appear on your other devices,
  and they're lost if you clear your browser data.
- Events that are over stay in the list, faded, with an **Ended** label.
- Tap the lime bookmark on a row to remove it.
- Nothing saved yet? Tap **Explore events**.

## 8. No signal (offline)

Once you've opened Happening with a connection, it keeps working on a weak or missing signal:

- **The app's pages still open**, including **Saved**, **About** and event pages you've opened before.
- If a search can't reach the server, you'll see the events from **your last successful search**
  with a notice: *"Can't reach the server. Showing events saved on <date>; they may be out of
  date."* Tap **Try again** when you're back online.
- If there's no saved search yet, you'll see **Something went wrong** with a **Try again** button.
- **The map stays blank (grey) offline**, because the map pictures come from the internet. The
  list still works.
- Directions, the official page and Waze need a connection.

## 9. Your privacy

- Your location, or the spot you pick, is used **only to search for events near it**.
- It's **rounded to about 100 m on your phone** before it's sent, and our server **doesn't store
  or log it**.
- There are **no accounts**, so nothing about you is stored on our servers.
- **Stored on your phone only:** your saved events, and the events from your last search (so the
  list opens offline). Your location and your filter choices are not saved.
- **Others involved:** the map pictures come from OpenStreetMap, which sees your IP address like
  any website. Directions open in Google Maps or Waze under their own privacy rules.
- You can turn location off in your browser at any time and pick a spot instead.

**To remove everything Happening keeps on your phone:** go to **About**, then tap
**Clear saved data**. This removes your saved events and your last search straight away (there's
no "are you sure?" step). The line next to the button then says *"No saved events on this phone."*

## 10. Accessibility

- **Keyboard:** every button, link, filter and event works with a keyboard (Tab to move, Enter or
  Space to press). Map dots can be reached with Tab too, and Escape closes the Filters sheet.
- **Screen readers** (TalkBack on Android, VoiceOver on iPhone): buttons and icons have names
  (for example "Save event", "Share event", "Filters"), and the app announces things like how many
  events were found.
- **Dark or light:** the app follows your phone's dark/light setting. Dark is the main look.
- **Reduced motion:** if you've turned on *Reduce motion* (iPhone) or *Remove animations*
  (Android), the sliding effects are switched off.
- **Colour is never the only signal:** for example, an active quick filter also shows a tick.
- Text gets bigger with your browser's zoom or text-size setting.

Something hard to use, read or reach? Please report it (section 12) and say which phone,
browser and setting (screen reader, large text, etc.) you were using.

## 11. Troubleshooting

**I said no to location and now Use my location doesn't work.**
Your browser remembers your answer. Re-allow it (steps are approximate and vary by version):
- *Android, Chrome:* tap the icon to the left of the address, then **Permissions** (or
  **Site settings**), then turn **Location** on. Reload the page.
- *iPhone, Safari:* **Settings** app → **Privacy & Security** → **Location Services** → make sure
  it's on and **Safari Websites** is set to *While Using the App*. You can also tap **aA** in the
  address bar → **Website Settings** → **Location** → **Allow**.
- If it still doesn't work, use **Pick a spot on the map** or **Or browse an area**. They give the
  same results.

**It says it can't share location, or it's very slow.**
Check you opened the `https://` address and that location (GPS) is on in the phone's settings.
Indoors it can take a while; after 10 seconds the app suggests picking a spot.

**No events found.**
Tap **Widen to … km**, open **Filters** and choose a bigger distance or **Next 30 days**, set
Category to **All** and Price to **Any**, or clear the search box. Remember events only cover the
Klang Valley and Kota Kinabalu, and only the next 30 days at most.

**The event details look wrong (time, price, venue).**
The **organiser's official page is always right**: tap **View official page** to check. Please tell
us what was wrong so we can fix the list.

**"This event isn't available"**
The link points to an event that's no longer in our list (the organiser may have removed it). Tap
**Find events near you**.

**"This event has ended"**
The event is over. Tap **Find events near you** to look for something else.

**The map is blank.**
You're probably offline, or the connection is slow. The list still works; the map fills in when
you're back online.

**My saved events disappeared.**
They're stored in the browser, so clearing browser data, using private/incognito mode, or
switching browser or phone means they won't be there.

**I see "Sample event" or "Sample data: real events coming soon."**
That event is a placeholder, not a real event.

## 12. Getting help and reporting a problem (UAT)

During user acceptance testing (23–29 Dec 2026), **contact the owner** with any problem, question
or idea. Recording your results uses the **separate UAT form** the owner sends you, not this manual.

When you report a problem, please include:

1. What you were trying to do, and which button you tapped.
2. What happened, and what you expected.
3. Your phone and browser (for example "Samsung A54, Chrome" or "iPhone 13, Safari"), and whether
   you used the home-screen icon or the browser.
4. A screenshot if you can. **Crop out or don't send anything showing your exact location.**
