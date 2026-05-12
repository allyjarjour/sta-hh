import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Restaurant } from "@/lib/types";

const dataFile = path.join(process.cwd(), "data", "restaurants.json");

async function ensureDataFile() {
  await mkdir(path.dirname(dataFile), { recursive: true });

  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, "[]\n", "utf8");
  }
}

export async function getRestaurants(): Promise<Restaurant[]> {
  await ensureDataFile();

  const contents = await readFile(dataFile, "utf8");
  const parsed = JSON.parse(contents) as Restaurant[];

  return parsed.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addRestaurant(restaurant: Restaurant) {
  const restaurants = await getRestaurants();

  await writeFile(
    dataFile,
    `${JSON.stringify([restaurant, ...restaurants], null, 2)}\n`,
    "utf8",
  );
}

export async function updateRestaurant(
  id: string,
  update: (restaurant: Restaurant) => Restaurant,
) {
  const restaurants = await getRestaurants();
  const updatedRestaurants = restaurants.map((restaurant) =>
    restaurant.id === id ? update(restaurant) : restaurant,
  );

  await writeFile(
    dataFile,
    `${JSON.stringify(updatedRestaurants, null, 2)}\n`,
    "utf8",
  );
}

export async function deleteRestaurant(id: string) {
  const restaurants = await getRestaurants();
  const updatedRestaurants = restaurants.filter(
    (restaurant) => restaurant.id !== id,
  );

  await writeFile(
    dataFile,
    `${JSON.stringify(updatedRestaurants, null, 2)}\n`,
    "utf8",
  );
}
