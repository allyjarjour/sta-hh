/**
 * One-time import of data/restaurants.json into Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... npx tsx scripts/migrate-json-to-supabase.ts
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { specialToInsert } from "../src/lib/supabase/types";
import type { Restaurant } from "../src/lib/types";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.",
    );
    process.exit(1);
  }

  const dataFile = path.join(process.cwd(), "data", "restaurants.json");
  const contents = await readFile(dataFile, "utf8");
  const restaurants = JSON.parse(contents) as Restaurant[];

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Importing ${restaurants.length} restaurants...`);

  for (const restaurant of restaurants) {
    const { error: restaurantError } = await supabase.from("restaurants").upsert(
      {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        website: restaurant.website,
        logo_url: restaurant.logoUrl,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        created_at: restaurant.createdAt,
        created_by: null,
      },
      { onConflict: "id" },
    );

    if (restaurantError) {
      console.error(`Failed restaurant ${restaurant.id}:`, restaurantError.message);
      process.exit(1);
    }

    await supabase.from("specials").delete().eq("restaurant_id", restaurant.id);

    if (restaurant.specials.length > 0) {
      const { error: specialsError } = await supabase
        .from("specials")
        .insert(
          restaurant.specials.map((special) =>
            specialToInsert(special, restaurant.id),
          ),
        );

      if (specialsError) {
        console.error(`Failed specials for ${restaurant.id}:`, specialsError.message);
        process.exit(1);
      }
    }

    console.log(`  ✓ ${restaurant.name}`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
