const MAX_URL_LENGTH = 2048;

export function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * After {@link normalizeWebsiteUrl}, require a parseable absolute URL with http(s) only.
 * Use for persisted website and optional logo URLs to avoid odd schemes in links and images.
 */
export function parsePublicHttpUrl(raw: string, fieldLabel: string): string {
  const normalized = normalizeWebsiteUrl(raw);

  if (!normalized) {
    throw new Error(`${fieldLabel} is required`);
  }

  if (normalized.length > MAX_URL_LENGTH) {
    throw new Error(`${fieldLabel} is too long`);
  }

  let url: URL;

  try {
    url = new URL(normalized);
  } catch {
    throw new Error(`Invalid ${fieldLabel}. Use a full URL starting with http:// or https://.`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Invalid ${fieldLabel}. Only http and https URLs are allowed.`);
  }

  if (!url.hostname) {
    throw new Error(`Invalid ${fieldLabel}. Use a full URL starting with http:// or https://.`);
  }

  return normalized;
}

export function parseOptionalPublicHttpUrl(
  raw: string | null,
  fieldLabel: string,
): string | null {
  if (!raw) {
    return null;
  }

  return parsePublicHttpUrl(raw, fieldLabel);
}

export function getWebsiteDomain(website: string) {
  const normalizedWebsite = normalizeWebsiteUrl(website);

  if (!normalizedWebsite) {
    return "";
  }

  try {
    return new URL(normalizedWebsite).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return normalizedWebsite.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
  }
}

export function getFaviconUrl(website: string) {
  const normalizedWebsite = normalizeWebsiteUrl(website);

  if (!normalizedWebsite) {
    return null;
  }

  try {
    const { hostname } = new URL(normalizedWebsite);

    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      hostname,
    )}&sz=128`;
  } catch {
    return null;
  }
}
