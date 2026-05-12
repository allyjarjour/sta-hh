"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addRestaurant,
  deleteRestaurant as deleteRestaurantRecord,
  updateRestaurant as updateRestaurantRecord,
} from "@/lib/data";
import {
  WEEKDAYS,
  type HappyHourSpecial,
  type Restaurant,
  type Weekday,
} from "@/lib/types";
import { getFaviconUrl, normalizeWebsiteUrl } from "../lib/logo";

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

export async function createRestaurant(formData: FormData) {
  const name = requiredString(formData, "name");
  const website = normalizeWebsiteUrl(requiredString(formData, "website"));
  const manualAddress = optionalString(formData, "address");
  const manualLogoUrl = optionalString(formData, "logoUrl");

  const restaurant: Restaurant = {
    id: crypto.randomUUID(),
    name,
    address: manualAddress ?? "",
    website,
    logoUrl: manualLogoUrl ?? getFaviconUrl(website),
    latitude: null,
    longitude: null,
    createdAt: new Date().toISOString(),
    specials: [buildSpecial(formData)],
  };

  await addRestaurant(restaurant);
  revalidatePath("/");
}

export async function updateRestaurant(formData: FormData) {
  const id = restaurantId(formData);
  const name = requiredString(formData, "name");
  const website = normalizeWebsiteUrl(requiredString(formData, "website"));
  const manualAddress = optionalString(formData, "address");
  const manualLogoUrl = optionalString(formData, "logoUrl");

  await updateRestaurantRecord(id, (restaurant) => ({
    ...restaurant,
    name,
    address: manualAddress ?? "",
    website,
    logoUrl: manualLogoUrl ?? getFaviconUrl(website),
    specials: [
      buildSpecial(formData, restaurant.specials[0]),
      ...restaurant.specials.slice(1),
    ],
  }));
  revalidatePath("/");
  redirect("/");
}

export async function deleteRestaurant(formData: FormData) {
  await deleteRestaurantRecord(restaurantId(formData));
  revalidatePath("/");
  redirect("/");
}
