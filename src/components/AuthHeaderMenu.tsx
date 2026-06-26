"use client";

import { Avatar, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { profileInitials } from "@/lib/profile-display";

type AuthHeaderMenuProps = {
  displayName: string;
  avatarUrl: string | null;
};

export function AuthHeaderMenu({ displayName, avatarUrl }: AuthHeaderMenuProps) {
  const initials = profileInitials(displayName);

  return (
    <Menu position="bottom-end" shadow="md" width={200} withinPortal>
      <Menu.Target>
        <UnstyledButton aria-label="Open account menu">
          <Group gap="xs" mih={32} wrap="nowrap">
            <Text
              fw={600}
              maw={{ base: 112, sm: 160 }}
              size="sm"
              title={displayName}
              truncate
            >
              {displayName}
            </Text>
            <Avatar color="orange" radius="xl" size={32} src={avatarUrl}>
              {initials}
            </Avatar>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item component={Link} href="/settings">
          Settings
        </Menu.Item>
        <form action={signOut}>
          <Menu.Item color="red" component="button" type="submit">
            Sign out
          </Menu.Item>
        </form>
      </Menu.Dropdown>
    </Menu>
  );
}
