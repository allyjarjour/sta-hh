/**
 * Forward geocoding via OSMF public Nominatim.
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */

import {
  ADDRESS_NOT_VERIFIED_IN_COUNTY_MESSAGE,
  OUTSIDE_ST_JOHNS_COUNTY_MESSAGE,
  type NominatimGeocodeHit,
  isStJohnsCountyHit,
} from "@/lib/st-johns-county";

const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const CACHE_MAX = 200;
/** OSMF policy: at most ~1 request/s to the public instance. */
const NOMINATIM_MIN_INTERVAL_MS = 1100;

export type GeocodeOutcome =
  | { status: "empty" }
  | { status: "ok"; latitude: number; longitude: number }
  | { status: "outside_county"; message: string }
  | { status: "not_verified"; message: string };

const resultCache = new Map<string, GeocodeOutcome>();
let lastNominatimRequestEnd = 0;

function nominatimUserAgent(): string {
  const fromEnv = process.env.NOMINATIM_USER_AGENT?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  return "st-augustine-happy-hours/1.0 (set NOMINATIM_USER_AGENT for production)";
}

function regionSuffix(): string {
  const fromEnv = process.env.NOMINATIM_REGION_SUFFIX?.trim();
  if (fromEnv) {
    return fromEnv.startsWith(",") ? fromEnv : `, ${fromEnv}`;
  }

  return ", St. Augustine, FL, USA";
}

function cacheResult(key: string, value: GeocodeOutcome) {
  if (resultCache.size >= CACHE_MAX) {
    const firstKey = resultCache.keys().next().value;
    if (firstKey !== undefined) {
      resultCache.delete(firstKey);
    }
  }

  resultCache.set(key, value);
}

/** Drop suite/unit/apt segments that often break Nominatim free-text search. */
function stripSecondaryDesignator(address: string): string {
  let next = address.replace(
    /\b(?:unit|suite|ste|apt)\s*#?\s*[a-z0-9-]+\b/gi,
    " ",
  );
  next = next.replace(/\s*,\s*,/g, ", ");
  next = next.replace(/\s+/g, " ").replace(/^\s*,|,\s*$/g, "").trim();
  return next;
}

function uniqueQueryStrings(attempts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of attempts) {
    const normalized = raw.trim().replace(/\s+/g, " ");
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    out.push(normalized);
  }

  return out;
}

function geocodeQueryAttempts(trimmed: string): string[] {
  const suffix = regionSuffix();
  const stripped = stripSecondaryDesignator(trimmed);
  const strippedDiffers = stripped !== trimmed;

  const primaryWithSuffix = strippedDiffers
    ? [`${stripped}${suffix}`, `${trimmed}${suffix}`]
    : [`${trimmed}${suffix}`];

  return uniqueQueryStrings([
    ...primaryWithSuffix,
    stripped,
    trimmed,
    `${stripped}, USA`,
    `${trimmed}, USA`,
  ]);
}

function outcomeFromHits(hits: NominatimGeocodeHit[]): GeocodeOutcome {
  const inCounty = hits.find((hit) => isStJohnsCountyHit(hit));

  if (inCounty) {
    const lat = inCounty.lat != null ? Number.parseFloat(inCounty.lat) : Number.NaN;
    const lon = inCounty.lon != null ? Number.parseFloat(inCounty.lon) : Number.NaN;

    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { status: "ok", latitude: lat, longitude: lon };
    }
  }

  if (hits.length > 0) {
    return { status: "outside_county", message: OUTSIDE_ST_JOHNS_COUNTY_MESSAGE };
  }

  return { status: "not_verified", message: ADDRESS_NOT_VERIFIED_IN_COUNTY_MESSAGE };
}

async function nominatimSearchOnce(query: string): Promise<GeocodeOutcome> {
  const cacheKey = query.toLowerCase();

  if (resultCache.has(cacheKey)) {
    const hit = resultCache.get(cacheKey);
    return hit ?? { status: "not_verified", message: ADDRESS_NOT_VERIFIED_IN_COUNTY_MESSAGE };
  }

  const gap = Date.now() - lastNominatimRequestEnd;
  if (gap < NOMINATIM_MIN_INTERVAL_MS) {
    await new Promise((resolve) => {
      setTimeout(resolve, NOMINATIM_MIN_INTERVAL_MS - gap);
    });
  }

  const url = new URL(NOMINATIM_SEARCH);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "us");

  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": nominatimUserAgent(),
      },
    });
  } catch {
    lastNominatimRequestEnd = Date.now();
    const outcome: GeocodeOutcome = {
      status: "not_verified",
      message: ADDRESS_NOT_VERIFIED_IN_COUNTY_MESSAGE,
    };
    cacheResult(cacheKey, outcome);
    return outcome;
  }

  lastNominatimRequestEnd = Date.now();

  if (!response.ok) {
    const outcome: GeocodeOutcome = {
      status: "not_verified",
      message: ADDRESS_NOT_VERIFIED_IN_COUNTY_MESSAGE,
    };
    cacheResult(cacheKey, outcome);
    return outcome;
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    const outcome: GeocodeOutcome = {
      status: "not_verified",
      message: ADDRESS_NOT_VERIFIED_IN_COUNTY_MESSAGE,
    };
    cacheResult(cacheKey, outcome);
    return outcome;
  }

  if (!Array.isArray(data) || data.length === 0) {
    const outcome: GeocodeOutcome = {
      status: "not_verified",
      message: ADDRESS_NOT_VERIFIED_IN_COUNTY_MESSAGE,
    };
    cacheResult(cacheKey, outcome);
    return outcome;
  }

  const outcome = outcomeFromHits(data as NominatimGeocodeHit[]);
  cacheResult(cacheKey, outcome);
  return outcome;
}

/**
 * Geocodes a free-form address and ensures it resolves within St. Johns County, FL.
 * Empty input skips geocoding (no map pin).
 */
export async function geocodeAddressForMap(
  freeformAddress: string,
): Promise<GeocodeOutcome> {
  const trimmed = freeformAddress.trim();
  if (!trimmed) {
    return { status: "empty" };
  }

  for (const query of geocodeQueryAttempts(trimmed)) {
    const outcome = await nominatimSearchOnce(query);

    if (outcome.status === "ok" || outcome.status === "outside_county") {
      return outcome;
    }
  }

  return {
    status: "not_verified",
    message: ADDRESS_NOT_VERIFIED_IN_COUNTY_MESSAGE,
  };
}
