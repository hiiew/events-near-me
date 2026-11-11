// D-06 — POST /api/events/search (api-spec.md §1).
// FR-04, FR-24, FR-28, NFR-08, NFR-09, NFR-10.
// POST (not GET) so coordinates never appear in URL logs (ADR-07). Only POST is
// exported, so Next.js answers other methods with 405 automatically.
import { SearchRequestSchema, type SearchResponse } from "@/lib/event-schema";
import { roundPoint } from "@/lib/geo";
import { searchAllSources } from "@/lib/sources/aggregator";
import { getEnabledAdapters } from "@/lib/sources/registry";

const MAX_BODY_BYTES = 1024;
const SEARCH_RADIUS_KM = 50;
const SEARCH_WINDOW_DAYS = 30;
const NO_STORE = { "Cache-Control": "no-store" };

function error(status: number, code: string, message?: string) {
  return Response.json({ error: code, ...(message ? { message } : {}) }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return error(413, "payload_too_large");

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return error(413, "payload_too_large");

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return error(400, "invalid_request", "Body must be JSON.");
  }

  const parsed = SearchRequestSchema.safeParse(body);
  if (!parsed.success) {
    // Name the field, never echo the submitted values (NFR-10).
    const field = parsed.error.issues[0]?.path.join(".") || "body";
    return error(400, "invalid_request", `Invalid or missing field: ${field}`);
  }

  try {
    const point = roundPoint(parsed.data); // re-round on the server too (NFR-09)
    const from = new Date();
    const to = new Date(from.getTime() + SEARCH_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const { events, sources } = await searchAllSources(getEnabledAdapters(), {
      ...point,
      radiusKm: SEARCH_RADIUS_KM,
      from,
      to,
    });
    const response: SearchResponse = { events, sources, generatedAt: from.toISOString() };
    return Response.json(response, { headers: NO_STORE });
  } catch {
    return error(500, "server_error");
  }
}
