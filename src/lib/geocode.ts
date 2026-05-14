/**
 * Forward geocoding via OSMF public Nominatim.
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */

const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const CACHE_MAX = 200;
/** OSMF policy: at most ~1 request/s to the public instance. */
const NOMINATIM_MIN_INTERVAL_MS = 1100;

const resultCache = new Map<string, { latitude: number; longitude: number } | null>();
let lastNominatimRequestEnd = 0;

type NominatimSearchHit = {
  lat?: string;
  lon?: string;
};

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

function cacheResult(
  key: string,
  value: { latitude: number; longitude: number } | null,
) {
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

async function nominatimSearchOnce(
  query: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const cacheKey = query.toLowerCase();

  if (resultCache.has(cacheKey)) {
    const hit = resultCache.get(cacheKey);
    return hit ? { ...hit } : null;
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
  url.searchParams.set("limit", "1");

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
    cacheResult(cacheKey, null);
    return null;
  }

  lastNominatimRequestEnd = Date.now();

  if (!response.ok) {
    cacheResult(cacheKey, null);
    return null;
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    cacheResult(cacheKey, null);
    return null;
  }

  if (!Array.isArray(data) || data.length === 0) {
    cacheResult(cacheKey, null);
    return null;
  }

  const first = data[0] as NominatimSearchHit;
  const lat = first.lat != null ? Number.parseFloat(first.lat) : Number.NaN;
  const lon = first.lon != null ? Number.parseFloat(first.lon) : Number.NaN;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    cacheResult(cacheKey, null);
    return null;
  }

  const coords = { latitude: lat, longitude: lon };
  cacheResult(cacheKey, coords);
  return coords;
}

/**
 * Returns coordinates for a free-form address, biased to the local region.
 * Empty or failed lookups return null (best-effort; callers persist nulls).
 */
export async function geocodeAddressForMap(
  freeformAddress: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const trimmed = freeformAddress.trim();
  if (!trimmed) {
    return null;
  }

  for (const query of geocodeQueryAttempts(trimmed)) {
    const coords = await nominatimSearchOnce(query);
    if (coords) {
      return coords;
    }
  }

  return null;
}
