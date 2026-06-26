"use client";

import {
  Anchor,
  Avatar,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateProfile } from "@/app/profile/actions";
import { profileInitials } from "@/lib/profile-display";
import type { UserProfile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [avatarUrlError, setAvatarUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDisplayNameError(null);
    setAvatarUrlError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await updateProfile(formData);

      if (!result.ok) {
        if (result.field === "displayName") {
          setDisplayNameError(result.message);
          return;
        }

        if (result.field === "avatarUrl") {
          setAvatarUrlError(result.message);
          return;
        }

        window.alert(result.message);
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  const previewName = displayName.trim() || profile.displayName;
  const previewAvatar = avatarUrl.trim() || null;

  return (
    <Paper p="xl" radius="xl" shadow="md" withBorder maw={480} mx="auto">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <div>
            <Text c="orange" fw={700} size="sm" tt="uppercase" lts={2}>
              Profile
            </Text>
            <Title order={2} mt={4}>
              Your account
            </Title>
            <Text c="dimmed" size="sm" mt="xs">
              Your display name and avatar appear in the header and on restaurants
              you add.
            </Text>
          </div>

          <Group gap="md">
            <Avatar color="orange" radius="xl" size={72} src={previewAvatar}>
              {profileInitials(previewName)}
            </Avatar>
            <Text c="dimmed" size="sm">
              Preview
            </Text>
          </Group>

          <TextInput
            error={displayNameError}
            label="Display name"
            maxLength={80}
            name="displayName"
            onChange={(event) => {
              setDisplayName(event.currentTarget.value);
              setDisplayNameError(null);
            }}
            required
            value={displayName}
          />

          <TextInput
            description="Optional. Use a public https:// image URL."
            error={avatarUrlError}
            inputMode="url"
            label="Avatar URL"
            name="avatarUrl"
            onChange={(event) => {
              setAvatarUrl(event.currentTarget.value);
              setAvatarUrlError(null);
            }}
            placeholder="https://example.com/avatar.jpg"
            type="url"
            value={avatarUrl}
          />

          <Button color="dark" fullWidth loading={isSubmitting} type="submit">
            {isSubmitting ? "Saving…" : "Save profile"}
          </Button>

          <Text c="dimmed" size="sm" ta="center">
            <Anchor component={Link} href="/">
              Back to happy hours
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
