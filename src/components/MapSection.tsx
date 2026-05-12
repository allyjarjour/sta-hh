"use client";

import { Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";
import dynamic from "next/dynamic";

import type { Restaurant } from "@/lib/types";

const RestaurantMap = dynamic(
  () =>
    import("@/components/RestaurantMap").then((module) => module.RestaurantMap),
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
    <Paper p="md" radius="xl" shadow="sm" withBorder>
      <Group align="end" justify="space-between" mb="md" px="xs">
        <Stack gap={2}>
          <Text c="orange" fw={700} size="sm" tt="uppercase" lts={2}>
            Map
          </Text>
          <Title order={2}>
            Participating restaurants
          </Title>
        </Stack>
        <Badge color="orange" variant="light">
          {mappedCount} of {restaurants.length} with coordinates
        </Badge>
      </Group>

      <RestaurantMap restaurants={restaurants} />
    </Paper>
  );
}
