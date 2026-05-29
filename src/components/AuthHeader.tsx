import { Button, Group, Text } from "@mantine/core";
import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { getAuthUser } from "@/lib/auth";

export async function AuthHeader() {
  const user = await getAuthUser();

  if (!user) {
    return (
      <Link href="/login">
        <Button component="span" variant="light" color="orange">
          Sign in
        </Button>
      </Link>
    );
  }

  return (
    <Group gap="sm">
      <Text c="dimmed" size="sm" visibleFrom="sm">
        {user.email}
      </Text>
      <form action={signOut}>
        <Button type="submit" variant="subtle" color="gray" size="sm">
          Sign out
        </Button>
      </form>
    </Group>
  );
}
