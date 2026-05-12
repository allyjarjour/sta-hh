import { deleteRestaurant, updateRestaurant } from "@/app/actions";
import { DeleteRestaurantButton } from "@/components/DeleteRestaurantButton";
import { SpecialDayFields } from "@/components/SpecialDayFields";
import { SpecialTimeFields } from "@/components/SpecialTimeFields";
import type { Restaurant } from "@/lib/types";

function formatTime(value: string) {
  const [hour, minute] = value.split(":");
  const date = new Date();

  date.setHours(Number(hour), Number(minute));

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatSpecialTime(special: Restaurant["specials"][number]) {
  if (special.allDay) {
    return "All day";
  }

  if (special.startTime && special.endTime) {
    return `${formatTime(special.startTime)}-${formatTime(special.endTime)}`;
  }

  return "Time TBD";
}

export function RestaurantList({ restaurants }: { restaurants: Restaurant[] }) {
  if (restaurants.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-orange-300 bg-white/70 p-8 text-center text-stone-600">
        No happy hours yet. Add the first participating restaurant to populate
        the list and map.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {restaurants.map((restaurant) => {
        const primarySpecial = restaurant.specials[0];

        return (
          <article
            key={restaurant.id}
            className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-100 text-xl font-bold text-orange-700">
                {restaurant.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    src={restaurant.logoUrl}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  restaurant.name.slice(0, 1)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-stone-950">
                      {restaurant.name}
                    </h3>
                    {restaurant.address ? (
                      <p className="mt-1 text-sm text-stone-600">
                        {restaurant.address}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700 hover:bg-orange-100"
                    >
                      Website
                    </a>
                    <form action={deleteRestaurant}>
                      <input
                        name="restaurantId"
                        type="hidden"
                        value={restaurant.id}
                      />
                      <DeleteRestaurantButton name={restaurant.name} />
                    </form>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {restaurant.specials.map((special) => (
                    <div
                      key={special.id}
                      className="rounded-2xl bg-stone-50 p-4 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-stone-950">
                          {special.title}
                        </p>
                        <p className="font-medium text-orange-700">
                          {formatSpecialTime(special)}
                        </p>
                      </div>
                      <p className="mt-1 text-stone-600">
                        {special.description}
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                        {special.days.join(" / ")}
                      </p>
                    </div>
                  ))}
                </div>

                <details className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-orange-700">
                    Edit restaurant
                  </summary>

                  <form action={updateRestaurant} className="mt-4 grid gap-4">
                    <input
                      name="restaurantId"
                      type="hidden"
                      value={restaurant.id}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-stone-700">
                        Restaurant name
                        <input
                          required
                          name="name"
                          defaultValue={restaurant.name}
                          className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-stone-700">
                        Website
                        <input
                          required
                          name="website"
                          inputMode="url"
                          defaultValue={restaurant.website}
                          className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        />
                      </label>
                    </div>

                    <label className="grid gap-2 text-sm font-medium text-stone-700">
                      Address
                      <input
                        name="address"
                        defaultValue={restaurant.address}
                        placeholder="Optional"
                        className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-stone-700">
                      Logo URL override
                      <input
                        name="logoUrl"
                        type="url"
                        placeholder="Leave blank to use website favicon"
                        className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </label>

                    <div className="rounded-2xl bg-white p-4">
                      <h4 className="font-semibold text-stone-950">
                        Happy hour special
                      </h4>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium text-stone-700">
                          Special title
                          <input
                            required
                            name="specialTitle"
                            defaultValue={primarySpecial?.title ?? ""}
                            className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-medium text-stone-700">
                          Details
                          <input
                            required
                            name="specialDescription"
                            defaultValue={primarySpecial?.description ?? ""}
                            className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                          />
                        </label>
                      </div>

                      <SpecialTimeFields
                        defaultAllDay={primarySpecial?.allDay ?? false}
                        defaultStartTime={primarySpecial?.startTime}
                        defaultEndTime={primarySpecial?.endTime}
                      />
                      <SpecialDayFields defaultDays={primarySpecial?.days} />
                    </div>

                    <button
                      type="submit"
                      className="rounded-2xl bg-stone-950 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                      Save changes
                    </button>
                  </form>
                </details>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
