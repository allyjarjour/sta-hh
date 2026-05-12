export function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
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
