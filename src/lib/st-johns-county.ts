/** User-facing copy when an address is outside the supported area. */
export const OUTSIDE_ST_JOHNS_COUNTY_MESSAGE =
  "This address is outside St. Johns County, FL. Only restaurants in St. Johns County are supported.";

export const ADDRESS_NOT_VERIFIED_IN_COUNTY_MESSAGE =
  "We couldn't verify that address is in St. Johns County, FL. Use a street address in St. Johns County.";

type NominatimAddress = {
  county?: string;
  state?: string;
};

export type NominatimGeocodeHit = {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: NominatimAddress;
};

/** Rough bounding box for St. Johns County, FL (fallback when county name is missing). */
const ST_JOHNS_BBOX = {
  minLat: 29.52,
  maxLat: 30.18,
  minLon: -81.72,
  maxLon: -81.2,
};

function normalizeCountyName(value: string) {
  return value
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isStJohnsCountyHit(hit: NominatimGeocodeHit): boolean {
  const county = hit.address?.county;
  if (county) {
    const normalized = normalizeCountyName(county);
    if (
      normalized.includes("st johns") ||
      normalized.includes("saint johns")
    ) {
      return true;
    }
    return false;
  }

  const lat = hit.lat != null ? Number.parseFloat(hit.lat) : Number.NaN;
  const lon = hit.lon != null ? Number.parseFloat(hit.lon) : Number.NaN;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return false;
  }

  return (
    lat >= ST_JOHNS_BBOX.minLat &&
    lat <= ST_JOHNS_BBOX.maxLat &&
    lon >= ST_JOHNS_BBOX.minLon &&
    lon <= ST_JOHNS_BBOX.maxLon
  );
}
