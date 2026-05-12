import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { deleteRestaurant } from "@/app/actions";
import { DeleteRestaurantButton } from "@/components/DeleteRestaurantButton";
import { RestaurantEditForm } from "@/components/RestaurantEditForm";
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
      <Paper p="xl" radius="xl" withBorder>
        <Text c="dimmed" ta="center">
          No happy hours yet. Add the first participating restaurant to populate
          the list and map.
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {restaurants.map((restaurant) => {
        return (
          <Card key={restaurant.id} p="lg" radius="xl" shadow="sm" withBorder>
            <Group align="flex-start" wrap="nowrap">
              <Avatar
                color="orange"
                radius="lg"
                size={64}
                src={restaurant.logoUrl}
              >
                {restaurant.name.slice(0, 1)}
              </Avatar>

              <Stack gap="md" flex={1}>
                <Group align="flex-start" justify="space-between">
                  <div>
                    <Title order={3}>{restaurant.name}</Title>
                    {restaurant.address ? (
                      <Text c="dimmed" size="sm" mt={4}>
                        {restaurant.address}
                      </Text>
                    ) : null}
                  </div>

                  <Group gap="xs">
                    <Button
                      component="a"
                      href={restaurant.website}
                      target="_blank"
                      rel="noreferrer"
                      color="orange"
                      size="xs"
                      variant="light"
                    >
                      Website
                    </Button>
                    <form action={deleteRestaurant}>
                      <input
                        name="restaurantId"
                        type="hidden"
                        value={restaurant.id}
                      />
                      <DeleteRestaurantButton name={restaurant.name} />
                    </form>
                  </Group>
                </Group>

                <Stack gap="sm">
                  {restaurant.specials.map((special) => (
                    <Paper key={special.id} bg="gray.0" p="md" radius="lg">
                      <Group justify="space-between" gap="xs">
                        <Text fw={700}>{special.title}</Text>
                        <Badge color="orange" variant="light">
                          {formatSpecialTime(special)}
                        </Badge>
                      </Group>
                      <Text c="dimmed" size="sm" mt={4}>
                        {special.description}
                      </Text>
                      <Text c="dimmed" fw={700} size="xs" mt="xs" tt="uppercase">
                        {special.days.join(" / ")}
                      </Text>
                    </Paper>
                  ))}
                </Stack>

                <Paper bg="orange.0" p="md" radius="lg" withBorder>
                  <details>
                    <summary className="cursor-pointer">
                      <Text c="orange" component="span" fw={700} size="sm">
                        Edit restaurant
                      </Text>
                    </summary>

                    <RestaurantEditForm restaurant={restaurant} />
                  </details>
                </Paper>
              </Stack>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
