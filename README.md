# Happy Hour Town

A starter website for collecting local restaurant happy-hour specials.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS for styling
- Server Actions for the add-restaurant form
- Domain favicon lookup for logos
- Leaflet + OpenStreetMap for the participating restaurant map
- Local JSON storage in `data/restaurants.json` for fast prototyping

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Restaurant details

When adding a restaurant, the website URL is used to derive a favicon-based
logo. The address field is optional and user-entered; leave it blank if you do
not have the address yet.

## Map setup

The map defaults to St. Augustine, FL when no restaurants have coordinates. Copy
`.env.example` to `.env.local` if you want to adjust the default map center:

```bash
NEXT_PUBLIC_MAP_CENTER_LAT=29.9012
NEXT_PUBLIC_MAP_CENTER_LNG=-81.3124
```

## Production notes

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a full pre-launch checklist (database
migration, env vars, Nominatim policy, abuse controls, and smoke tests).

The local JSON store is intentionally simple; serverless hosts should not rely
on writable `data/restaurants.json` as the long-term source of truth.
