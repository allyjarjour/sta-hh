# Deployment checklist

Use this list before and after the app goes live. Items are ordered roughly by impact.

## 1. Supabase (database + auth)

Persistence and authentication use **Supabase Postgres** and **Supabase Auth**. Schema lives in [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql), [`supabase/migrations/002_profiles.sql`](supabase/migrations/002_profiles.sql), and [`supabase/migrations/003_restaurant_edits.sql`](supabase/migrations/003_restaurant_edits.sql).

### One-time setup

1. Create a [Supabase](https://supabase.com) project.
2. Run `supabase/migrations/001_initial.sql`, `002_profiles.sql`, and `003_restaurant_edits.sql` in the SQL editor (or `supabase db push` if you use the CLI).
3. Enable **Email** provider under Authentication → Providers and turn on **Allow new users to sign up**.
4. Under **Authentication → URL configuration**, set Site URL (e.g. `http://localhost:3000` for dev) and add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain/auth/callback`
5. Import seed data (optional): with env vars set locally, run `npm run migrate:json` to load [`data/restaurants.json`](data/restaurants.json). The JSON file is a backup/seed only; production reads from Postgres.

Contributors can **sign up at `/login`** or you can still invite users manually from Authentication → Users.

### Row Level Security (RLS)

- **SELECT** on `restaurants`, `specials`, and `profiles`: public (anyone can browse; profile name/avatar shown on listings).
- **INSERT / UPDATE / DELETE** on `restaurants` and `specials`: `authenticated` role only (any signed-in user in v1).
- **UPDATE** on `profiles`: owner only (`auth.uid() = id`).
- Server actions use the **anon key + user session** so RLS enforces writes; the service role key is **not** used by the web app.

## 2. Environment variables

Copy from [`.env.example`](.env.example) into `.env.local` (dev) and your host’s env UI (production).

| Variable | Notes |
|----------|--------|
| **`NEXT_PUBLIC_SUPABASE_URL`** | Project URL from Supabase → Settings → API. |
| **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** | Public client key from Supabase (may be labeled publishable or anon). Safe in the browser; RLS limits what it can do. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Server-only. Used by `npm run migrate:json` only. **Never** expose as `NEXT_PUBLIC_*` or ship to client bundles. |
| **`NOMINATIM_USER_AGENT`** | **Set in production.** OSMF requires an identifiable app string (name + contact URL or email). |
| `NEXT_PUBLIC_MAP_CENTER_LAT` / `NEXT_PUBLIC_MAP_CENTER_LNG` | Default map center when no pins exist. |
| `NOMINATIM_REGION_SUFFIX` | Optional geocoding bias override. |

`NEXT_PUBLIC_*` values are inlined at build time on many hosts—rebuild after changing them if your platform does not inject at runtime.

## 3. Outbound network

The server (Server Actions) must reach:

- **Your Supabase project** (`*.supabase.co`) — database and auth.
- **`https://nominatim.openstreetmap.org`** — geocoding on create/update ([usage policy](https://operations.osmfoundation.org/policies/nominatim/): ~1 req/s).
- **`https://www.google.com/s2/favicons`** — logo fallback (`src/lib/logo.ts`).

Browsers load **OSM tiles** and **Leaflet** from `RestaurantMap`; adjust CSP if you add strict headers.

## 4. Access model

- **Browse:** Home page and map work without signing in.
- **Write:** Add, edit, and delete require a Supabase Auth session (UI hidden + server action check + RLS).
- v1: any authenticated user can edit any restaurant (no per-owner RLS yet).

## 5. Geocoding expectations

- Coordinates from **Nominatim**; pins are often road- or area-level.
- Failed geocoding stores `latitude` / `longitude` as `null` (no pin).

## 6. Site metadata

- Update [`src/app/layout.tsx`](src/app/layout.tsx) metadata / Open Graph as needed for SEO.

## 7. `data/restaurants.json`

- Seed / backup only after migration to Supabase.
- Do not treat committed JSON as the production source of truth.

## 8. HTTPS and domain

- Serve over **HTTPS**.
- Add your production URL to Supabase **Authentication → URL configuration** (Site URL, redirect URLs) if auth redirects fail.

## 9. Operational hygiene

- Monitor server action and Supabase errors.
- Backups: use Supabase project backups / PITR on paid tiers.
- Run `npm audit` on a schedule; align Node with the host.

## 10. Legal / attribution

- Keep **OpenStreetMap** attribution visible on the map.
- Follow [Nominatim / OSM](https://operations.osmfoundation.org/policies/nominatim/) terms for the public API.

## 11. Post-deploy smoke test

- [ ] Home loads without signing in; list and map show data from Supabase.
- [ ] Anonymous user does **not** see add form, edit panel, or delete buttons.
- [ ] Sign up at `/login` (or sign in) → header shows display name, avatar, and sign out.
- [ ] `/settings` saves display name and optional avatar URL.
- [ ] Signed-in user can add a restaurant → appears after refresh with “Added by …” attribution; map pin when geocoded.
- [ ] Edit a restaurant → “Last edited by …” and timestamp appear on the listing.
- [ ] Edit and delete work when signed in; sign out blocks further writes.
- [ ] Production `NOMINATIM_USER_AGENT` set; geocoding returns coords for a known-good address.

---

For stricter control later: per-user ownership via `created_by` + RLS, OAuth providers, or an admin role.
