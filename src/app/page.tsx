import { MapSection } from "@/components/MapSection";
import { RestaurantForm } from "@/components/RestaurantForm";
import { RestaurantList } from "@/components/RestaurantList";
import { getRestaurants } from "@/lib/data";
import { getWebsiteDomain } from "@/lib/logo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const restaurants = await getRestaurants();
  const totalSpecials = restaurants.reduce(
    (count, restaurant) => count + restaurant.specials.length,
    0,
  );
  const uniqueRestaurantCount = new Set(
    restaurants.map((restaurant) => getWebsiteDomain(restaurant.website)),
  ).size;

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-5 py-8 md:px-8 lg:py-12">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
        <div>
          <div className="inline-flex rounded-full border border-orange-200 bg-white/70 px-4 py-2 text-sm font-medium text-orange-700 shadow-sm">
            Local happy hours, all in one place
          </div>

          <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-stone-950 md:text-7xl">
            Find tonight&apos;s best deals around town.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
            Collect restaurant specials by day and show every participating spot on a shared town map.
          </p>

          <div className="mt-8 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
              <p className="text-3xl font-black text-stone-950">
                {uniqueRestaurantCount}
              </p>
              <p className="mt-1 text-sm text-stone-600">Restaurants</p>
            </div>
            <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
              <p className="text-3xl font-black text-stone-950">
                {totalSpecials}
              </p>
              <p className="mt-1 text-sm text-stone-600">Specials</p>
            </div>
          </div>
        </div>

        <RestaurantForm />
      </section>

      <MapSection restaurants={restaurants} />

      <section className="grid gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Specials
          </p>
          <h2 className="mt-1 text-2xl font-bold text-stone-950">
            Current happy hours
          </h2>
        </div>

        <RestaurantList restaurants={restaurants} />
      </section>
    </main>
  );
}
