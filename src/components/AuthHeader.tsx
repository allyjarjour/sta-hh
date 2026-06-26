import { Avatar, Button, Group, Text } from "@mantine/core";
import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { getAuthUser } from "@/lib/auth";
import { profileInitials } from "@/lib/profile-display";
import { getProfile } from "@/lib/profiles";

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

  const profile = await getProfile(user.id);
  const displayName = profile?.displayName ?? user.email ?? "Account";

  return (
    <Group gap="sm" wrap="nowrap">
      <Link
        className="hidden text-inherit no-underline sm:flex"
        href="/settings"
      >
        <Group gap="xs" wrap="nowrap">
          <Avatar
            color="orange"
            radius="xl"
            size={32}
            src={profile?.avatarUrl}
          >
            {profileInitials(displayName)}
          </Avatar>
          <Text fw={600} size="sm">
            {displayName}
          </Text>
        </Group>
      </Link>
      <form action={signOut}>
        <Button type="submit" variant="subtle" color="gray" size="sm">
          Sign out
        </Button>
      </form>
    </Group>
  );
}
