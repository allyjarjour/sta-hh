"use client";

import {
  Alert,
  Anchor,
  Button,
  Paper,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";

const MIN_PASSWORD_LENGTH = 6;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "confirmation") {
      setError(
        "We could not confirm your email. The link may have expired — try signing up again or sign in if you already confirmed.",
      );
      return;
    }

    if (searchParams.get("error") === "reset") {
      setError(
        "Your password reset link is invalid or has expired. Request a new one below.",
      );
    }
  }, [searchParams]);

  function handleModeChange(value: string) {
    setMode(value as AuthMode);
    setError(null);
    setSuccessMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    if (!email || !password) {
      setError("Email and password are required.");
      setIsSubmitting(false);
      return;
    }

    if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();

    if (mode === "signin") {
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
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setSuccessMessage(
      "Account created. Check your email for a confirmation link, then sign in.",
    );
    setMode("signin");
  }

  const isSignUp = mode === "signup";

  return (
    <Paper p="xl" radius="xl" shadow="md" withBorder maw={420} mx="auto">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <div>
            <Text c="orange" fw={700} size="sm" tt="uppercase" lts={2}>
              Account
            </Text>
            <Title order={2} mt={4}>
              {isSignUp ? "Create account" : "Sign in"}
            </Title>
            <Text c="dimmed" size="sm" mt="xs">
              {isSignUp
                ? "Create an account to add and edit happy hour listings."
                : "Sign in to add and edit participating restaurants."}
            </Text>
          </div>

          <SegmentedControl
            fullWidth
            onChange={handleModeChange}
            value={mode}
            data={[
              { label: "Sign in", value: "signin" },
              { label: "Sign up", value: "signup" },
            ]}
          />

          {error ? (
            <Alert color="red" title={isSignUp ? "Could not sign up" : "Could not sign in"}>
              {error}
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert color="green" title="Almost there">
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

          <PasswordInput
            autoComplete={isSignUp ? "new-password" : "current-password"}
            description={
              isSignUp ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined
            }
            label="Password"
            name="password"
            required
          />

          {!isSignUp ? (
            <Text size="sm" ta="right">
              <Anchor component={Link} href="/login/forgot-password" size="sm">
                Forgot password?
              </Anchor>
            </Text>
          ) : null}

          <Button color="dark" fullWidth loading={isSubmitting} type="submit">
            {isSubmitting
              ? isSignUp
                ? "Creating account…"
                : "Signing in…"
              : isSignUp
                ? "Create account"
                : "Sign in"}
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
