import { AppShellHeader, Container, Group } from "@mantine/core";
import Link from "next/link";

import { AuthHeader } from "@/components/AuthHeader";
import { HappyHourLogo } from "@/components/HappyHourLogo";

export function SiteHeader() {
  return (
    <AppShellHeader withBorder={false}>
      <Container size="xl" h="100%">
        <Group h="100%" justify="space-between" wrap="nowrap">
          <Link className="text-inherit no-underline" href="/">
            <HappyHourLogo showWordmark size={44} />
          </Link>
          <AuthHeader />
        </Group>
      </Container>
    </AppShellHeader>
  );
}
