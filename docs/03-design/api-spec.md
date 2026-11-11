# API Specification — Happening

| Field | Value |
|---|---|
| Phase | 3 — Design |
| Version | 1.0 (draft for approval) |
| Date | 2026-11-11 |

> **What is an API spec?** It's the contract between the frontend and the backend: which URLs
> exist, what you send, what you get back, and what errors look like. Writing it *before* coding
> means frontend and backend can be built and tested separately. **OpenAPI** is the industry
> standard format; a snippet is included below.

The app has **one** internal endpoint. Event data from third parties is only ever fetched by the
server (NFR-06).

## 1. `POST /api/events/search` (D-06)

Returns upcoming events within **50 km** of a point for the **next 30 days**. The browser then
filters locally (ADR-06).

**Why POST and not GET?** Coordinates in a URL end up in hosting logs. A JSON body doesn't
(ADR-07, NFR-10).

### Request

```http
POST /api/events/search
Content-Type: application/json

{ "lat": 3.139, "lon": 101.687 }
```

| Field | Type | Rules |
|---|---|---|
| `lat` | number | −90 ≤ lat ≤ 90; at most 3 decimal places (client rounds, server re-rounds) |
| `lon` | number | −180 ≤ lon ≤ 180; at most 3 decimal places |

Unknown fields are rejected. Body larger than 1 KB is rejected.

### Response `200 OK`

```json
{
  "events": [
    {
      "id": "curated:kl-0001",
      "sourceId": "curated",
      "title": "EXAMPLE — Weekend Craft Market",
      "description": "Example only.",
      "start": "2026-12-05T10:00:00+08:00",
      "end": "2026-12-05T18:00:00+08:00",
      "venue": { "name": "Example Hall", "address": "Kuala Lumpur", "lat": 3.15, "lon": 101.7 },
      "category": "food",
      "price": { "min": 0, "currency": "MYR" },
      "url": "https://example.com/event",
      "imageUrl": null
    }
  ],
  "sources": [
    { "id": "curated", "ok": true, "count": 1 },
    { "id": "eventbrite", "ok": false, "count": 0 }
  ],
  "generatedAt": "2026-11-11T08:00:00Z"
}
```

- `events` are sorted by `start` ascending; ended events are already removed (FR-05).
- If any `sources[].ok` is `false`, the UI shows "Some sources are unavailable" (FR-28).
- Distance is **not** included — the browser computes it (so the server never needs to keep the point).

### Errors

| Status | When | Body |
|---|---|---|
| 400 | Missing/invalid `lat`/`lon`, extra fields, bad JSON | `{ "error": "invalid_request", "message": "lat must be between -90 and 90" }` |
| 405 | Method other than POST | `{ "error": "method_not_allowed" }` |
| 413 | Body > 1 KB | `{ "error": "payload_too_large" }` |
| 500 | Unexpected server error (never because one source failed) | `{ "error": "server_error" }` |

Error responses never echo the submitted coordinates.

### Headers

- `Cache-Control: no-store` (response depends on location; must not be cached by shared caches).

## 2. OpenAPI 3.1 snippet

```yaml
openapi: 3.1.0
info: { title: Happening internal API, version: 1.0.0 }
paths:
  /api/events/search:
    post:
      summary: Upcoming events within 50 km of a point (next 30 days)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              additionalProperties: false
              required: [lat, lon]
              properties:
                lat: { type: number, minimum: -90, maximum: 90 }
                lon: { type: number, minimum: -180, maximum: 180 }
      responses:
        "200":
          description: Events and per-source status
          content:
            application/json:
              schema: { $ref: "#/components/schemas/SearchResponse" }
        "400": { $ref: "#/components/responses/Error" }
        "413": { $ref: "#/components/responses/Error" }
        "500": { $ref: "#/components/responses/Error" }
components:
  responses:
    Error:
      description: Error
      content:
        application/json:
          schema:
            type: object
            properties: { error: { type: string }, message: { type: string } }
  schemas:
    SearchResponse:
      type: object
      required: [events, sources, generatedAt]
      properties:
        events: { type: array, items: { $ref: "#/components/schemas/Event" } }
        sources:
          type: array
          items:
            type: object
            properties: { id: { type: string }, ok: { type: boolean }, count: { type: integer } }
        generatedAt: { type: string, format: date-time }
    Event:
      type: object
      required: [id, sourceId, title, description, start, venue, category, price, url]
      properties:
        id: { type: string }
        sourceId: { enum: [curated, eventbrite, predicthq] }
        title: { type: string }
        description: { type: string }
        start: { type: string, format: date-time }
        end: { type: string, format: date-time }
        venue:
          type: object
          required: [name]
          properties:
            name: { type: string }
            address: { type: string }
            lat: { type: number }
            lon: { type: number }
        category: { enum: [music, food, arts, sports, learning, tech, nightlife, other] }
        price:
          oneOf:
            - type: "null"
            - type: object
              required: [min, currency]
              properties:
                min: { type: number, minimum: 0 }
                max: { type: number }
                currency: { type: string }
        url: { type: string, format: uri }
        imageUrl: { type: [string, "null"], format: uri }
```

## 3. Internal adapter interface (server-side, not HTTP)

```ts
interface SourceAdapter {
  id: "curated" | "eventbrite" | "predicthq";
  isEnabled(): boolean;                       // env ENABLED_SOURCES + required keys present
  getEvents(q: {
    lat: number; lon: number;
    radiusKm: number;                         // 50
    from: Date; to: Date;                     // now → +30 days
  }): Promise<Event[]>;                       // throws on failure; aggregator handles it
}
```

## 4. Outbound calls to third parties (summary)

| Adapter | Call | Notes |
|---|---|---|
| eventbrite | For each ID in `EVENTBRITE_ORGANIZER_IDS`: list the organiser's live events with venue details **[exact endpoint and params to be confirmed in the Eventbrite spike]** | Server filters by distance/date after mapping |
| predicthq | Events search by point + radius + date range **[verify]** | Only if a free plan is confirmed |
| curated | Read `data/curated-events.json` | No network |
