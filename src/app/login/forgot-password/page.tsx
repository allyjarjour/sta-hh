import { AppShell, AppShellMain, Container } from "@mantine/core";

import { ForgotPasswordForm } from "@/app/login/forgot-password/ForgotPasswordForm";

export const metadata = {
  title: "Reset password — STA Happy Hour",
};

export default function ForgotPasswordPage() {
  return (
    <AppShell padding="md">
      <AppShellMain>
        <Container size="sm" py={{ base: "xl", md: 64 }}>
          <ForgotPasswordForm />
        </Container>
      </AppShellMain>
    </AppShell>
  );
}
