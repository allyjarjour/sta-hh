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

import { DeleteRestaurantButton } from "@/components/DeleteRestaurantButton";
import { RestaurantEditForm } from "@/components/RestaurantEditForm";
import { profileInitials, formatListingTimestamp } from "@/lib/profile-display";
import type { Restaurant, Weekday } from "@/lib/types";

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

export function RestaurantList({
  restaurants,
  weekdayFilter = null,
  noMatchesForFilter = false,
  isAuthenticated = false,
}: {
  restaurants: Restaurant[];
  weekdayFilter?: Weekday | null;
  noMatchesForFilter?: boolean;
  isAuthenticated?: boolean;
}) {
  if (noMatchesForFilter && weekdayFilter) {
    return (
      <Paper p="xl" radius="xl" withBorder>
        <Text c="dimmed" ta="center">
          No specials on{" "}
          <Text component="span" fw={700} inherit>
            {weekdayFilter}
          </Text>
          . Pick another day or choose &quot;All days&quot;.
        </Text>
      </Paper>
    );
  }

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
        const specialsToShow = weekdayFilter
          ? restaurant.specials.filter((special) =>
              special.days.includes(weekdayFilter),
            )
          : restaurant.specials;

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
                    {restaurant.contributor ? (
                      <Group gap="xs" mt="sm">
                        <Avatar
                          color="orange"
                          radius="xl"
                          size={24}
                          src={restaurant.contributor.avatarUrl}
                        >
                          {profileInitials(restaurant.contributor.displayName)}
                        </Avatar>
                        <Text c="dimmed" size="sm">
                          Added by{" "}
                          <Text component="span" fw={600} inherit>
                            {restaurant.contributor.displayName}
                          </Text>{" "}
                          on{" "}
                          <Text component="span" fw={600} inherit>
                            {formatListingTimestamp(restaurant.createdAt)}
                          </Text>
                        </Text>
                      </Group>
                    ) : null}
                    {restaurant.updatedAt ? (
                      <Group gap="xs" mt={restaurant.contributor ? 4 : "sm"}>
                        {restaurant.editor ? (
                          <Avatar
                            color="gray"
                            radius="xl"
                            size={24}
                            src={restaurant.editor.avatarUrl}
                          >
                            {profileInitials(restaurant.editor.displayName)}
                          </Avatar>
                        ) : null}
                        <Text c="dimmed" size="sm">
                          Last edited
                          {restaurant.editor ? (
                            <>
                              {" "}
                              by{" "}
                              <Text component="span" fw={600} inherit>
                                {restaurant.editor.displayName}
                              </Text>
                            </>
                          ) : null}{" "}
                          on{" "}
                          <Text component="span" fw={600} inherit>
                            {formatListingTimestamp(restaurant.updatedAt)}
                          </Text>
                        </Text>
                      </Group>
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
                    {isAuthenticated ? (
                      <DeleteRestaurantButton
                        restaurantId={restaurant.id}
                        name={restaurant.name}
                      />
                    ) : null}
                  </Group>
                </Group>

                <Stack gap="sm">
                  {specialsToShow.map((special) => (
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

                {isAuthenticated ? (
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
                ) : null}
              </Stack>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
