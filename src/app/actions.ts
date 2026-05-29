"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addRestaurant,
  deleteRestaurant as deleteRestaurantRecord,
  getRestaurants,
  updateRestaurant as updateRestaurantRecord,
} from "@/lib/data";
import type { ActionResult } from "@/lib/action-result";
import { geocodeAddressForMap } from "@/lib/geocode";
import {
  WEEKDAYS,
  type HappyHourSpecial,
  type Restaurant,
  type Weekday,
} from "@/lib/types";
import {
  getFaviconUrl,
  parseOptionalPublicHttpUrl,
  parsePublicHttpUrl,
} from "../lib/logo";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required`);
  }

  return value.trim();
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function selectedDays(formData: FormData) {
  const values = formData.getAll("days").filter((day): day is Weekday => {
    return typeof day === "string" && WEEKDAYS.includes(day as Weekday);
  });

  if (values.length === 0) {
    throw new Error("Choose at least one day for the special");
  }

  return values;
}

function getSpecialTimes(formData: FormData) {
  const allDay = formData.get("allDay") === "on";
  const startTime = allDay ? null : optionalString(formData, "startTime");
  const endTime = allDay ? null : optionalString(formData, "endTime");

  if (!allDay && (!startTime || !endTime)) {
    throw new Error("Start and end times are required unless the special is all day");
  }

  return { allDay, startTime, endTime };
}

function restaurantId(formData: FormData) {
  return requiredString(formData, "restaurantId");
}

function buildSpecial(formData: FormData, existingSpecial?: HappyHourSpecial) {
  const specialTimes = getSpecialTimes(formData);

  return {
    id: existingSpecial?.id ?? crypto.randomUUID(),
    title: requiredString(formData, "specialTitle"),
    description: requiredString(formData, "specialDescription"),
    days: selectedDays(formData),
    allDay: specialTimes.allDay,
    startTime: specialTimes.startTime,
    endTime: specialTimes.endTime,
  };
}

async function coordinatesForAddress(
  address: string,
  previous?: {
    address: string;
    latitude: number | null;
    longitude: number | null;
  },
): Promise<
  | { ok: true; latitude: number | null; longitude: number | null }
  | { ok: false; message: string }
> {
  const next = address.trim();
  if (!next) {
    return { ok: true, latitude: null, longitude: null };
  }

  if (
    previous &&
    next === previous.address.trim() &&
    previous.latitude !== null &&
    previous.longitude !== null
  ) {
    return {
      ok: true,
      latitude: previous.latitude,
      longitude: previous.longitude,
    };
  }

  const outcome = await geocodeAddressForMap(next);

  if (outcome.status === "empty") {
    return { ok: true, latitude: null, longitude: null };
  }

  if (outcome.status === "ok") {
    return {
      ok: true,
      latitude: outcome.latitude,
      longitude: outcome.longitude,
    };
  }

  return { ok: false, message: outcome.message };
}

export async function createRestaurant(formData: FormData): Promise<ActionResult> {
  try {
    const name = requiredString(formData, "name");
    const website = parsePublicHttpUrl(requiredString(formData, "website"), "Website");
    const manualAddress = optionalString(formData, "address");
    const manualLogoUrl = optionalString(formData, "logoUrl");
    const address = manualAddress ?? "";

    const coords = await coordinatesForAddress(address);
    if (!coords.ok) {
      return { ok: false, message: coords.message, field: "address" };
    }

    const { latitude, longitude } = coords;

    const restaurant: Restaurant = {
      id: crypto.randomUUID(),
      name,
      address,
      website,
      logoUrl:
        parseOptionalPublicHttpUrl(manualLogoUrl, "Logo URL") ?? getFaviconUrl(website),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      specials: [buildSpecial(formData)],
    };

    await addRestaurant(restaurant);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not save restaurant.",
    };
  }
}

export async function updateRestaurant(formData: FormData): Promise<ActionResult> {
  try {
    const id = restaurantId(formData);
    const name = requiredString(formData, "name");
    const website = parsePublicHttpUrl(requiredString(formData, "website"), "Website");
    const manualAddress = optionalString(formData, "address");
    const manualLogoUrl = optionalString(formData, "logoUrl");
    const address = manualAddress ?? "";

    const restaurants = await getRestaurants();
    const existing = restaurants.find((restaurant) => restaurant.id === id);
    if (!existing) {
      return { ok: false, message: "Restaurant not found." };
    }

    const coords = await coordinatesForAddress(address, {
      address: existing.address,
      latitude: existing.latitude,
      longitude: existing.longitude,
    });
    if (!coords.ok) {
      return { ok: false, message: coords.message, field: "address" };
    }

    const { latitude, longitude } = coords;

    await updateRestaurantRecord(id, (restaurant) => ({
      ...restaurant,
      name,
      address,
      website,
      logoUrl:
        parseOptionalPublicHttpUrl(manualLogoUrl, "Logo URL") ?? getFaviconUrl(website),
      latitude,
      longitude,
      specials: [
        buildSpecial(formData, restaurant.specials[0]),
        ...restaurant.specials.slice(1),
      ],
    }));
    revalidatePath("/");
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not save restaurant.",
    };
  }

  redirect("/");
}

export async function deleteRestaurant(formData: FormData) {
  await deleteRestaurantRecord(restaurantId(formData));
  revalidatePath("/");
  redirect("/");
}
