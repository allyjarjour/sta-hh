# STA Happy Hour

A site for collecting and browsing local happy-hour specials in the St. Augustine area. Anyone can browse; trusted contributors sign in to add, edit, or remove listings.

https://github.com/user-attachments/assets/13b8ab32-e665-4e5e-82c9-844ff4f57e47



## Stack

- **Next.js** (App Router) + TypeScript
- **Mantine** for UI components
- **Tailwind CSS** for layout utilities
- **Supabase** — Postgres persistence, Row Level Security, and email/password auth
- **Server Actions** for create, update, and delete
- **Leaflet** + OpenStreetMap for the restaurant map
- **Nominatim** for geocoding addresses (St. Johns County, FL)
- **Google favicon API** for restaurant logos when no override URL is set

Seed data lives in [`data/restaurants.json`](data/restaurants.json) for import only; the running app reads from Supabase.

## Run locally

1. Create a [Supabase](https://supabase.com) project and run [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql) in the SQL editor.
2. Copy [`.env.example`](.env.example) to `.env.local` and fill in Supabase URL and publishable (anon) key.
3. Create at least one user in Supabase → **Authentication → Users → Add user** (there is no public sign-up UI).
4. Optional: import seed restaurants:

   ```bash
   npm install
   npm run migrate:json   # requires SUPABASE_SERVICE_ROLE_KEY in .env.local
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). Sign in at [http://localhost:3000/login](http://localhost:3000/login).

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Browser/client key (publishable or legacy anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | For `migrate:json` only | Never expose to the client |
| `NOMINATIM_USER_AGENT` | Recommended | Identifiable app string for geocoding (required in production) |
| `NEXT_PUBLIC_MAP_CENTER_LAT` / `LNG` | No | Default map center when no pins exist |

See [`.env.example`](.env.example) for the full list.

## Features

- **Browse** — List and map of restaurants and specials without an account.
- **Contribute** — Signed-in users can add restaurants, edit specials, and delete entries (UI + server actions + RLS).
- **Geocoding** — Optional address on add/edit; validated to St. Johns County when coordinates are resolved.
- **Logos** — Derived from the restaurant website favicon unless a logo URL override is provided.

## Auth

- The app exposes **sign in** only (`/login`). New accounts are created in the **Supabase dashboard** (or by enabling sign-up in Supabase and adding UI later).
- v1 policy: any authenticated user can edit any restaurant (no per-owner rows yet).

## Restaurant details

When adding a restaurant, the website URL is used to derive a favicon-based logo. The address field is optional; leave it blank if you do not have it yet. Addresses are geocoded through Nominatim when provided.

## Map setup

The map defaults to St. Augustine, FL when no restaurants have coordinates. Override the center in `.env.local`:

```bash
NEXT_PUBLIC_MAP_CENTER_LAT=29.9012
NEXT_PUBLIC_MAP_CENTER_LNG=-81.3124
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run migrate:json` | One-time import from `data/restaurants.json` into Supabase |

## Production

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for Supabase URL configuration, Vercel env vars, Nominatim policy, RLS behavior, and smoke tests.

Do not rely on a writable `data/restaurants.json` on serverless hosts — production data should live in Supabase only.
