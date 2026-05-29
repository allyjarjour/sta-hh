"use client";

import {
  Alert,
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    if (!email || !password) {
      setError("Email and password are required.");
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
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
              Sign in
            </Title>
            <Text c="dimmed" size="sm" mt="xs">
              Use the email and password from your Supabase project.
            </Text>
          </div>

          {error ? (
            <Alert color="red" title="Could not sign in">
              {error}
            </Alert>
          ) : null}

          <TextInput
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />

          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            required
          />

          <Button type="submit" color="dark" loading={isSubmitting} fullWidth>
            {isSubmitting ? "Signing in…" : "Sign in"}
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
