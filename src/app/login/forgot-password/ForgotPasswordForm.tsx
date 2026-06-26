"use client";

import {
  Alert,
  Anchor,
  Button,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim() ?? "";

    if (!email) {
      setError("Email is required.");
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccessMessage(
      "If an account exists for that email, you will receive a password reset link shortly.",
    );
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
              Reset password
            </Title>
            <Text c="dimmed" size="sm" mt="xs">
              Enter your email and we will send you a link to choose a new password.
            </Text>
          </div>

          {error ? (
            <Alert color="red" title="Could not send reset email">
              {error}
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert color="green" title="Check your email">
              {successMessage}
            </Alert>
          ) : null}

          <TextInput
            autoComplete="email"
            label="Email"
            name="email"
            required
            type="email"
          />

          <Button color="dark" fullWidth loading={isSubmitting} type="submit">
            {isSubmitting ? "Sending…" : "Send reset link"}
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
