import type { HappyHourSpecial, Restaurant, UserProfile, Weekday } from "@/types";

export type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  updated_at: string;
};

export function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}

export type RestaurantRow = {
  id: string;
  name: string;
  address: string;
  website: string;
  logo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  specials?: SpecialRow[];
};

export type SpecialRow = {
  id: string;
  restaurant_id: string;
  title: string;
  description: string;
  days: Weekday[];
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
};

export function mapSpecialRow(row: SpecialRow): HappyHourSpecial {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    days: row.days,
    allDay: row.all_day,
    startTime: row.start_time,
    endTime: row.end_time,
  };
}

export function mapRestaurantRow(row: RestaurantRow): Restaurant {
  const specials = (row.specials ?? []).map(mapSpecialRow);

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    website: row.website,
    logoUrl: row.logo_url,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    specials,
  };
}

export function specialToInsert(special: HappyHourSpecial, restaurantId: string) {
  return {
    id: special.id,
    restaurant_id: restaurantId,
    title: special.title,
    description: special.description,
    days: special.days,
    all_day: special.allDay,
    start_time: special.startTime,
    end_time: special.endTime,
  };
}
