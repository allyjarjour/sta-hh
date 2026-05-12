"use client";

import { useRef, useState } from "react";

import { createRestaurant } from "@/app/actions";
import { SpecialDayFields } from "@/components/SpecialDayFields";
import { SpecialTimeFields } from "@/components/SpecialTimeFields";

export function RestaurantForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [resetKey, setResetKey] = useState(0);

  async function handleCreateRestaurant(formData: FormData) {
    await createRestaurant(formData);
    formRef.current?.reset();
    setResetKey((currentKey) => currentKey + 1);
  }

  return (
    <form
      ref={formRef}
      action={handleCreateRestaurant}
      className="grid gap-5 rounded-3xl border border-orange-200 bg-white/85 p-6 shadow-sm backdrop-blur"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Add a spot
        </p>
        <h2 className="mt-2 text-2xl font-bold text-stone-950">
          List a participating restaurant
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Paste the restaurant website and the app will use it to pull a logo.
          Add the address if you want it shown on the listing.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Restaurant name
          <input
            required
            name="name"
            placeholder="The Corner Bistro"
            className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Website
          <input
            required
            name="website"
            inputMode="url"
            placeholder="www.example.com"
            className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Address
        <input
          name="address"
          placeholder="Optional"
          className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Logo URL override
        <input
          name="logoUrl"
          type="url"
          placeholder="Optional"
          className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
        />
      </label>

      <div className="rounded-3xl bg-orange-50 p-5">
        <h3 className="font-semibold text-stone-950">Happy hour special</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Special title
            <input
              required
              name="specialTitle"
              placeholder="$6 margaritas"
              className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Details
            <input
              required
              name="specialDescription"
              placeholder="Tacos, margaritas, and draft beers at the bar"
              className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </label>
        </div>

        <SpecialTimeFields key={`time-${resetKey}`} />

        <SpecialDayFields key={`day-${resetKey}`} />
      </div>

      <button
        type="submit"
        className="rounded-2xl bg-stone-950 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
      >
        Add happy hour
      </button>
    </form>
  );
}
