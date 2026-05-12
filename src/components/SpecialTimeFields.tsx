"use client";

import { useState } from "react";

type SpecialTimeFieldsProps = {
  defaultAllDay?: boolean;
  defaultStartTime?: string | null;
  defaultEndTime?: string | null;
};

export function SpecialTimeFields({
  defaultAllDay = false,
  defaultStartTime,
  defaultEndTime,
}: SpecialTimeFieldsProps) {
  const [allDay, setAllDay] = useState(defaultAllDay);

  return (
    <>
      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-medium text-stone-700">
        <input
          name="allDay"
          type="checkbox"
          checked={allDay}
          onChange={(event) => setAllDay(event.target.checked)}
        />
        This special lasts all day
      </label>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Starts
          <input
            name="startTime"
            type="time"
            defaultValue={defaultStartTime ?? ""}
            disabled={allDay}
            required={!allDay}
            className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
          />
          <span className="text-xs font-normal text-stone-500">
            Required unless the special lasts all day.
          </span>
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Ends
          <input
            name="endTime"
            type="time"
            defaultValue={defaultEndTime ?? ""}
            disabled={allDay}
            required={!allDay}
            className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
          />
          <span className="text-xs font-normal text-stone-500">
            Required unless the special lasts all day.
          </span>
        </label>
      </div>
    </>
  );
}
