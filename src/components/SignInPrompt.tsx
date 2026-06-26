"use client";

import { Anchor, Paper, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export function SignInPrompt() {
  return (
    <Paper p="xl" radius="xl" shadow="md" withBorder>
      <Stack gap="md">
        <div>
          <Text c="orange" fw={700} size="sm" tt="uppercase" lts={2}>
            Contributors
          </Text>
          <Title order={2} mt={4}>
            Sign in to add restaurants
          </Title>
        </div>
        <Text c="dimmed">
          Anyone can browse happy hours. To list or edit participating spots,{" "}
          <Anchor component={Link} href="/login" fw={600}>
            sign in or create an account
          </Anchor>
          .
        </Text>
      </Stack>
    </Paper>
  );
}
