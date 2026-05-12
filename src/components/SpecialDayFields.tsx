"use client";

import { Checkbox, Group } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

import { WEEKDAYS, type Weekday } from "@/lib/types";

type SpecialDayFieldsProps = {
  defaultDays?: Weekday[];
};

export function SpecialDayFields({ defaultDays = [] }: SpecialDayFieldsProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(defaultDays);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const form = groupRef.current?.closest("form");

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
      groupRef.current?.querySelector("input")?.focus();
    }

    form.addEventListener("submit", validateDaySelection);

    return () => form.removeEventListener("submit", validateDaySelection);
  }, [selectedDays]);

  return (
    <Checkbox.Group
      ref={groupRef}
      label="Available days"
      value={selectedDays}
      error={error}
      onChange={(value) => {
        setError(null);
        setSelectedDays(value as Weekday[]);
      }}
    >
      <Group gap="xs" mt="xs" mb={5}>
        {WEEKDAYS.map((day) => (
          <Checkbox
            key={day}
            name="days"
            value={day}
            label={day.slice(0, 3)}
          />
        ))}
      </Group>
    </Checkbox.Group>
  );
}
