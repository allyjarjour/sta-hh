import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Badge,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { HappyHourLogo } from "@/components/HappyHourLogo";
import { RestaurantForm } from "@/components/RestaurantForm";
import { SpecialsBrowseSection } from "@/components/SpecialsBrowseSection";
import { getRestaurants } from "@/lib/data";
import { getWebsiteDomain } from "@/lib/logo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const restaurants = await getRestaurants();
  const totalSpecials = restaurants.reduce(
    (count, restaurant) => count + restaurant.specials.length,
    0,
  );
  const uniqueRestaurantCount = new Set(
    restaurants.map((restaurant) => getWebsiteDomain(restaurant.website)),
  ).size;

  return (
    <AppShell header={{ height: 72 }} padding="md">
      <AppShellHeader withBorder={false}>
        <Container size="xl" h="100%">
          <Group h="100%">
            <HappyHourLogo showWordmark size={44} />
          </Group>
        </Container>
      </AppShellHeader>

      <AppShellMain>
        <Container size="xl" py={{ base: "xl", md: 48 }}>
          <Stack gap="xl">
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl" verticalSpacing="xl">
              <Stack justify="center" gap="lg">
                <Badge color="orange" size="lg" variant="light" w="fit-content">
                  Local happy hours, all in one place
                </Badge>

                <Title order={1} size="clamp(3rem, 8vw, 6rem)" lh={0.95}>
                  Find tonight&apos;s best deals around town.
                </Title>

                <Text c="dimmed" size="xl" maw={680}>
                  Collect restaurant specials by day and show every participating
                  spot on a shared town map.
                </Text>

                <SimpleGrid cols={{ base: 2, sm: 3 }} maw={560}>
                  <Paper p="lg" radius="xl" shadow="xs" withBorder>
                    <Text fw={900} size="2rem" lh={1}>
                      {uniqueRestaurantCount}
                    </Text>
                    <Text c="dimmed" size="sm" mt={4}>
                      Restaurants
                    </Text>
                  </Paper>
                  <Paper p="lg" radius="xl" shadow="xs" withBorder>
                    <Text fw={900} size="2rem" lh={1}>
                      {totalSpecials}
                    </Text>
                    <Text c="dimmed" size="sm" mt={4}>
                      Specials
                    </Text>
                  </Paper>
                </SimpleGrid>
              </Stack>

              <RestaurantForm />
            </SimpleGrid>

            <SpecialsBrowseSection restaurants={restaurants} />
          </Stack>
        </Container>
      </AppShellMain>
    </AppShell>
  );
}
