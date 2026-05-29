"use client";

import { Chip, Group, Stack, Text, Title } from "@mantine/core";
import { useMemo, useState } from "react";

import { MapSection } from "@/components/MapSection";
import { RestaurantList } from "@/components/RestaurantList";
import { WEEKDAYS, type Restaurant, type Weekday } from "@/lib/types";

const ALL_DAYS = "all" as const;

export function SpecialsBrowseSection({
  restaurants,
  isAuthenticated = false,
}: {
  restaurants: Restaurant[];
  isAuthenticated?: boolean;
}) {
  const [dayValue, setDayValue] = useState<string>(ALL_DAYS);

  const weekdayFilter: Weekday | null =
    dayValue === ALL_DAYS ? null : (dayValue as Weekday);

  const listRestaurants = useMemo(() => {
    if (!weekdayFilter) {
      return restaurants;
    }

    return restaurants.filter((restaurant) =>
      restaurant.specials.some((special) => special.days.includes(weekdayFilter)),
    );
  }, [restaurants, weekdayFilter]);

  const hasData = restaurants.length > 0;
  const noMatchesForFilter = Boolean(
    weekdayFilter && hasData && listRestaurants.length === 0,
  );

  return (
    <Stack gap="md">
      <div>
        <Text c="orange" fw={700} size="sm" tt="uppercase" lts={2}>
          Specials
        </Text>
        <Title order={2}>Current happy hours</Title>
        <Text c="dimmed" size="sm" mt="xs" maw={640}>
          Filter by day to see which spots run a special that day. The map shows
          only those restaurants.
        </Text>
      </div>

      <Chip.Group
        value={dayValue}
        onChange={setDayValue}
        aria-label="Filter specials by day of week"
      >
        <Group gap="xs" wrap="wrap">
          <Chip value={ALL_DAYS} variant="filled">
            All days
          </Chip>
          {WEEKDAYS.map((day) => (
            <Chip key={day} value={day} variant="light" title={day}>
              {day.slice(0, 3)}
            </Chip>
          ))}
        </Group>
      </Chip.Group>

      {hasData ? <MapSection restaurants={listRestaurants} /> : null}

      <RestaurantList
        restaurants={listRestaurants}
        weekdayFilter={weekdayFilter}
        noMatchesForFilter={noMatchesForFilter}
        isAuthenticated={isAuthenticated}
      />
    </Stack>
  );
}
