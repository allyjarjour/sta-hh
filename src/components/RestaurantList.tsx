import {
  Avatar,
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { DeleteRestaurantButton } from "@/components/DeleteRestaurantButton";
import { RestaurantEditForm } from "@/components/RestaurantEditForm";
import { profileInitials, formatListingTimestamp } from "@/lib/profile-display";
import type { Restaurant, Weekday } from "@/types";

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

function ProfileAttribution({
  avatarColor,
  avatarUrl,
  displayName,
  prefix,
  timestamp,
}: {
  avatarColor: "gray" | "orange";
  avatarUrl: string | null;
  displayName: string;
  prefix: string;
  timestamp: string;
}) {
  return (
    <Group align="center" gap="xs" wrap="nowrap">
      <Avatar
        color={avatarColor}
        radius="xl"
        size={24}
        src={avatarUrl}
      >
        {profileInitials(displayName)}
      </Avatar>
      <Text c="dimmed" size="sm">
        {prefix}{" "}
        <Text component="span" fw={600} inherit>
          {displayName}
        </Text>{" "}
        on{" "}
        <Text component="span" fw={600} inherit>
          {formatListingTimestamp(timestamp)}
        </Text>
      </Text>
    </Group>
  );
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
                      <Flex mt="sm">
                        <ProfileAttribution
                          avatarColor="orange"
                          avatarUrl={restaurant.contributor.avatarUrl}
                          displayName={restaurant.contributor.displayName}
                          prefix="Added by"
                          timestamp={restaurant.createdAt}
                        />
                      </Flex>
                    ) : null}
                    {restaurant.updatedAt ? (
                      <Flex mt={restaurant.contributor ? 4 : "sm"}>
                        {restaurant.editor ? (
                          <ProfileAttribution
                            avatarColor="gray"
                            avatarUrl={restaurant.editor.avatarUrl}
                            displayName={restaurant.editor.displayName}
                            prefix="Last edited by"
                            timestamp={restaurant.updatedAt}
                          />
                        ) : (
                          <Text c="dimmed" size="sm">
                            Last edited on{" "}
                            <Text component="span" fw={600} inherit>
                              {formatListingTimestamp(restaurant.updatedAt)}
                            </Text>
                          </Text>
                        )}
                      </Flex>
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
