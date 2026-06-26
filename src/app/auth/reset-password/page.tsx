import { AppShell, AppShellMain, Container } from "@mantine/core";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/app/auth/reset-password/ResetPasswordForm";
import { getAuthUser } from "@/lib/auth";

export const metadata = {
  title: "New password — STA Happy Hour",
};

export default async function ResetPasswordPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login?error=reset");
  }

  return (
    <AppShell padding="md">
      <AppShellMain>
        <Container size="sm" py={{ base: "xl", md: 64 }}>
          <ResetPasswordForm />
        </Container>
      </AppShellMain>
    </AppShell>
  );
}
