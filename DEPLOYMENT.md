# Deployment checklist

Use this list before and after the app goes live. Items are ordered roughly by impact.

## 1. Data storage (critical)

The app reads and writes **`data/restaurants.json`** via `src/lib/data.ts` using the local filesystem.

- **Serverless hosts (e.g. Vercel):** The filesystem is **not** a durable writable database. Writes may fail, disappear between invocations, or be inconsistent under concurrent requests.
- **Action:** Move persistence to a **hosted database** (Postgres + Neon/Supabase/Railway, etc.) or object storage with clear concurrency rules. Keep the same `Restaurant` shape or migrate JSON → DB once.

## 2. Environment variables

Copy from `.env.example` and set in the host’s env UI (or secrets manager).

| Variable | Notes |
|----------|--------|
| **`NOMINATIM_USER_AGENT`** | **Set in production.** OSMF requires an identifiable app string (name + contact URL or email). The dev fallback is not appropriate for a public site. |
| `NEXT_PUBLIC_MAP_CENTER_LAT` / `NEXT_PUBLIC_MAP_CENTER_LNG` | Default map center when no pins exist; adjust if the town changes. |
| `NOMINATIM_REGION_SUFFIX` | Optional override for geocoding bias (default appends St. Augustine, FL, USA). |

Build-time vs runtime: `NEXT_PUBLIC_*` is inlined at build time on many hosts—rebuild after changing them if your platform does not inject at runtime.

## 3. Outbound network

The server (Server Actions) must be allowed to reach:

- **`https://nominatim.openstreetmap.org`** — geocoding on create/update (respect [usage policy](https://operations.osmfoundation.org/policies/nominatim/): ~1 req/s, no autocomplete abuse, attribution for OSM-derived data).
- **`https://www.google.com/s2/favicons`** — logo fallback from website domain (`src/lib/logo.ts`).

Browsers load **OSM tiles** and **Leaflet** assets from configured URLs in `RestaurantMap`; ensure CSP / ad blockers do not break the map on your domain if you add strict headers later.

## 4. Geocoding expectations

- Coordinates come from **Nominatim**; pins are often **road- or area-level**, not exact suites.
- Failures store `latitude` / `longitude` as `null` (no pin); users are not notified in-app today.
- Heavy traffic or strict policy may require **self-hosted Nominatim**, a commercial geocoder, or **manual lat/lng** fields later.

## 5. Abuse, spam, and trust

- **Anyone can submit** restaurants via the public form (no auth).
- **Action for public launch:** Rate limiting (edge middleware or host rules), CAPTCHA, moderation queue, or sign-in—pick what matches your risk tolerance.
- **PII:** Address fields are user-supplied; document retention and handle takedown requests if needed.

## 6. Site metadata and branding

- **`src/app/layout.tsx`:** `metadata.title` / `description` are generic (“Happy Hour Town”). Update for SEO and social previews; add `openGraph` / `twitter` if you care about link cards.

## 7. `data/restaurants.json` in version control

- Decide whether committed JSON is **seed data only** and production uses DB, or whether you **never** commit live user data (privacy, accidental leaks).
- Add `.gitignore` rules or a separate private backup strategy if the file holds real submissions.

## 8. HTTPS and domain

- Serve the app over **HTTPS** (standard on Vercel/Netlify/etc.).
- If you use **absolute URLs** anywhere later, align them with the production domain.

## 9. `next.config.ts`

- **`allowedDevOrigins`** is for LAN dev; harmless in production but not required. Add other Next config (images, headers, redirects) as the product grows.

## 10. Operational hygiene

- **Monitoring:** Log or alert on server action failures (especially file/DB writes and geocode errors).
- **Backups:** If you stay on JSON temporarily on a VPS, schedule backups of `data/restaurants.json`.
- **Dependencies:** Run `npm audit` / Dependabot on a schedule.
- **Node version:** Align local and CI with the host’s supported Node (see host docs).

## 11. Legal / attribution

- **Map tiles:** OpenStreetMap attribution is included in the Leaflet tile layer; keep it visible if you change map UI.
- **Nominatim / OSM data:** [ODbL](https://wiki.openstreetmap.org/wiki/OpenStreetMap_License) applies to substantial extracts; follow OSMF terms for the public API.

## 12. Post-deploy smoke test

- [ ] Home loads; map tiles render.
- [ ] Add a restaurant (with address) → appears in list and **map pin** after refresh (or immediately if client refresh path works).
- [ ] Edit and delete still persist (against your real store, not only local disk).
- [ ] Production `NOMINATIM_USER_AGENT` set and geocoding returns coords for a known-good test address.

---

After persistence and env vars are solid, treat **auth/moderation** and **accurate geocoding** as the next two levers for production quality.
