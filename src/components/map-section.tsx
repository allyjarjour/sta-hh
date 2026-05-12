"use client";

import dynamic from "next/dynamic";

import type { Restaurant } from "@/lib/types";

const RestaurantMap = dynamic(
  () =>
    import("@/components/restaurant-map").then((module) => module.RestaurantMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[28rem] items-center justify-center rounded-3xl bg-orange-100 text-stone-600">
        Loading map...
      </div>
    ),
  },
);

export function MapSection({ restaurants }: { restaurants: Restaurant[] }) {
  const mappedCount = restaurants.filter(
    (restaurant) =>
      restaurant.latitude !== null && restaurant.longitude !== null,
  ).length;

  return (
    <section className="rounded-[2rem] border border-orange-200 bg-white/75 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Map
          </p>
          <h2 className="mt-1 text-2xl font-bold text-stone-950">
            Participating restaurants
          </h2>
        </div>
        <p className="text-sm text-stone-600">
          {mappedCount} of {restaurants.length} with coordinates
        </p>
      </div>

      <RestaurantMap restaurants={restaurants} />
    </section>
  );
}
