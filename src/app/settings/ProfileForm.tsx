"use client";

import {
  Anchor,
  Avatar,
  Button,
  FileInput,
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
import { uploadAvatar, validateAvatarFile } from "@/lib/avatars";
import { profileInitials } from "@/lib/profile-display";
import type { UserProfile } from "@/types";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [avatarUrlError, setAvatarUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  async function handleAvatarFileChange(file: File | null) {
    setAvatarUploadError(null);
    setAvatarFile(file);

    if (!file) {
      return;
    }

    const validationError = validateAvatarFile(file);

    if (validationError) {
      setAvatarUploadError(validationError);
      setAvatarFile(null);
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const publicUrl = await uploadAvatar(profile.id, file);
      setAvatarUrl(publicUrl);
      setAvatarUploadError(null);
      setAvatarFile(null);
    } catch (error) {
      setAvatarUploadError(
        error instanceof Error ? error.message : "Could not upload avatar.",
      );
      setAvatarFile(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDisplayNameError(null);
    setAvatarUploadError(null);
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
  const isBusy = isSubmitting || isUploadingAvatar;

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

          <Group align="center" gap="md">
            <Avatar color="orange" radius="xl" size={72} src={previewAvatar}>
              {profileInitials(previewName)}
            </Avatar>
            <Stack gap="xs">
              <FileInput
                accept="image/png,image/jpeg,image/webp,image/gif"
                clearable
                description="JPEG, PNG, WebP, or GIF up to 2 MB."
                disabled={isBusy}
                error={avatarUploadError}
                label="Upload avatar"
                onChange={handleAvatarFileChange}
                placeholder="Choose an image"
                value={avatarFile}
              />
              {isUploadingAvatar ? (
                <Text c="dimmed" size="sm">
                  Uploading…
                </Text>
              ) : null}
            </Stack>
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
            description="Optional. Upload above or paste a public https:// image URL."
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

          <Button color="dark" disabled={isBusy} fullWidth loading={isSubmitting} type="submit">
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
