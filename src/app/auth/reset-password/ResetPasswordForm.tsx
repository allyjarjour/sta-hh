"use client";

import {
  Alert,
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 6;

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password")?.toString() ?? "";
    const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Paper p="xl" radius="xl" shadow="md" withBorder maw={420} mx="auto">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <div>
            <Text c="orange" fw={700} size="sm" tt="uppercase" lts={2}>
              Account
            </Text>
            <Title order={2} mt={4}>
              Choose a new password
            </Title>
            <Text c="dimmed" size="sm" mt="xs">
              Enter a new password for your account.
            </Text>
          </div>

          {error ? (
            <Alert color="red" title="Could not update password">
              {error}
            </Alert>
          ) : null}

          <PasswordInput
            autoComplete="new-password"
            description={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            label="New password"
            name="password"
            required
          />

          <PasswordInput
            autoComplete="new-password"
            label="Confirm password"
            name="confirmPassword"
            required
          />

          <Button color="dark" fullWidth loading={isSubmitting} type="submit">
            {isSubmitting ? "Saving…" : "Update password"}
          </Button>

          <Text c="dimmed" size="sm" ta="center">
            <Anchor component={Link} href="/login">
              Back to sign in
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
