"use client";

import { Checkbox, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

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
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);

  useEffect(() => {
    const form = startTimeRef.current?.form;

    if (!form) {
      return;
    }

    function validateTimes(event: SubmitEvent) {
      if (allDay) {
        return;
      }

      const missingStartTime = !startTimeRef.current?.value;
      const missingEndTime = !endTimeRef.current?.value;

      setStartTimeError(
        missingStartTime ? "Choose a start time or mark this all day." : null,
      );
      setEndTimeError(
        missingEndTime ? "Choose an end time or mark this all day." : null,
      );

      if (missingStartTime || missingEndTime) {
        event.preventDefault();
        (missingStartTime ? startTimeRef : endTimeRef).current?.focus();
      }
    }

    form.addEventListener("submit", validateTimes);

    return () => form.removeEventListener("submit", validateTimes);
  }, [allDay]);

  return (
    <Stack gap="sm">
      <Checkbox
        name="allDay"
        checked={allDay}
        label="This special lasts all day"
        onChange={(event) => {
          setAllDay(event.target.checked);

          if (event.target.checked) {
            setStartTimeError(null);
            setEndTimeError(null);
          }
        }}
      />

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput
          ref={startTimeRef}
          label="Starts"
          name="startTime"
          type="time"
          defaultValue={defaultStartTime ?? ""}
          disabled={allDay}
          error={startTimeError}
          onChange={() => setStartTimeError(null)}
        />
        <TextInput
          ref={endTimeRef}
          label="Ends"
          name="endTime"
          type="time"
          defaultValue={defaultEndTime ?? ""}
          disabled={allDay}
          error={endTimeError}
          onChange={() => setEndTimeError(null)}
        />
      </SimpleGrid>
    </Stack>
  );
}
