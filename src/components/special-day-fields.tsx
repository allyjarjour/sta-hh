"use client";

import { useEffect, useRef, useState } from "react";

import { WEEKDAYS, type Weekday } from "@/lib/types";

type SpecialDayFieldsProps = {
  defaultDays?: Weekday[];
};

export function SpecialDayFields({ defaultDays = [] }: SpecialDayFieldsProps) {
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(defaultDays);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const form = fieldsetRef.current?.closest("form");

    if (!form) {
      return;
    }

    function validateDaySelection(event: SubmitEvent) {
      if (selectedDays.length > 0) {
        setError(null);
        return;
      }

      event.preventDefault();
      setError("Choose at least one day for the special.");
      fieldsetRef.current?.querySelector("input")?.focus();
    }

    form.addEventListener("submit", validateDaySelection);

    return () => form.removeEventListener("submit", validateDaySelection);
  }, [selectedDays]);

  function toggleDay(day: Weekday) {
    setError(null);
    setSelectedDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((currentDay) => currentDay !== day)
        : [...currentDays, day],
    );
  }

  return (
    <fieldset ref={fieldsetRef} className="mt-4">
      <legend className="text-sm font-medium text-stone-700">
        Available days
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {WEEKDAYS.map((day) => (
          <label
            key={day}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-2 text-sm text-stone-700"
          >
            <input
              name="days"
              type="checkbox"
              value={day}
              checked={selectedDays.includes(day)}
              aria-invalid={error ? "true" : "false"}
              onChange={() => toggleDay(day)}
            />
            {day.slice(0, 3)}
          </label>
        ))}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </fieldset>
  );
}
