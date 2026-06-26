import { createClient } from "@/lib/supabase/server";
import {
  mapRestaurantRow,
  specialToInsert,
  type RestaurantRow,
} from "@/lib/supabase/types";
import { attachContributors, getProfilesByIds } from "@/lib/profiles";
import type { Restaurant } from "@/lib/types";

const restaurantSelect = `
  id,
  name,
  address,
  website,
  logo_url,
  latitude,
  longitude,
  created_at,
  created_by,
  updated_at,
  updated_by,
  specials (
    id,
    restaurant_id,
    title,
    description,
    days,
    all_day,
    start_time,
    end_time
  )
`;

export async function getRestaurants(): Promise<Restaurant[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select(restaurantSelect)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const restaurants = ((data ?? []) as RestaurantRow[]).map(mapRestaurantRow);
  const profileIds = restaurants.flatMap((restaurant) =>
    [restaurant.createdBy, restaurant.updatedBy].filter((id): id is string => Boolean(id)),
  );
  const profiles = await getProfilesByIds(profileIds);

  return attachContributors(restaurants, profiles);
}

export async function addRestaurant(restaurant: Restaurant, createdBy?: string) {
  const supabase = await createClient();

  const { error: restaurantError } = await supabase.from("restaurants").insert({
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.address,
    website: restaurant.website,
    logo_url: restaurant.logoUrl,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    created_at: restaurant.createdAt,
    created_by: createdBy ?? null,
  });

  if (restaurantError) {
    throw new Error(restaurantError.message);
  }

  if (restaurant.specials.length > 0) {
    const { error: specialsError } = await supabase
      .from("specials")
      .insert(
        restaurant.specials.map((special) =>
          specialToInsert(special, restaurant.id),
        ),
      );

    if (specialsError) {
      throw new Error(specialsError.message);
    }
  }
}

export async function updateRestaurant(
  id: string,
  update: (restaurant: Restaurant) => Restaurant,
  updatedBy?: string,
) {
  const restaurants = await getRestaurants();
  const existing = restaurants.find((restaurant) => restaurant.id === id);

  if (!existing) {
    throw new Error("Restaurant not found");
  }

  const updated = update(existing);
  const supabase = await createClient();

  const { error: restaurantError } = await supabase
    .from("restaurants")
    .update({
      name: updated.name,
      address: updated.address,
      website: updated.website,
      logo_url: updated.logoUrl,
      latitude: updated.latitude,
      longitude: updated.longitude,
      ...(updatedBy
        ? {
            updated_at: new Date().toISOString(),
            updated_by: updatedBy,
          }
        : {}),
    })
    .eq("id", id);

  if (restaurantError) {
    throw new Error(restaurantError.message);
  }

  const { error: deleteSpecialsError } = await supabase
    .from("specials")
    .delete()
    .eq("restaurant_id", id);

  if (deleteSpecialsError) {
    throw new Error(deleteSpecialsError.message);
  }

  if (updated.specials.length > 0) {
    const { error: insertSpecialsError } = await supabase
      .from("specials")
      .insert(
        updated.specials.map((special) => specialToInsert(special, id)),
      );

    if (insertSpecialsError) {
      throw new Error(insertSpecialsError.message);
    }
  }
}

export async function deleteRestaurant(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("restaurants").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
