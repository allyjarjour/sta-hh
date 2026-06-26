import { Button } from "@mantine/core";
import Link from "next/link";

import { AuthHeaderMenu } from "@/components/AuthHeaderMenu";
import { getAuthUser } from "@/lib/auth";
import { getProfile } from "@/lib/profiles";

export async function AuthHeader() {
  const user = await getAuthUser();

  if (!user) {
    return (
      <Link href="/login">
        <Button component="span" variant="light" color="orange">
          Sign in
        </Button>
      </Link>
    );
  }

  const profile = await getProfile(user.id);
  const displayName = profile?.displayName ?? user.email ?? "Account";

  return (
    <AuthHeaderMenu
      avatarUrl={profile?.avatarUrl ?? null}
      displayName={displayName}
    />
  );
}
