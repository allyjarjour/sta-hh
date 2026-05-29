import { AppShell, AppShellMain, Container } from "@mantine/core";

import { LoginForm } from "@/app/login/LoginForm";

export const metadata = {
  title: "Sign in — STA Happy Hour",
};

export default function LoginPage() {
  return (
    <AppShell padding="md">
      <AppShellMain>
        <Container size="sm" py={{ base: "xl", md: 64 }}>
          <LoginForm />
        </Container>
      </AppShellMain>
    </AppShell>
  );
}
