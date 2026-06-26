import { AppShell, AppShellMain, Container } from "@mantine/core";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/app/settings/ProfileForm";
import { getAuthUser } from "@/lib/auth";
import { getProfile, upsertProfile } from "@/lib/profiles";

export const metadata = {
  title: "Settings — STA Happy Hour",
};

export default async function SettingsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  let profile = await getProfile(user.id);

  if (!profile) {
    const displayName = user.email?.split("@")[0] ?? "User";
    await upsertProfile(user.id, { displayName, avatarUrl: null });
    profile = await getProfile(user.id);
  }

  if (!profile) {
    redirect("/login");
  }

  return (
    <AppShell padding="md">
      <AppShellMain>
        <Container size="sm" py={{ base: "xl", md: 64 }}>
          <ProfileForm profile={profile} />
        </Container>
      </AppShellMain>
    </AppShell>
  );
}
