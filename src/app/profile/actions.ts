"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { requireAuthUser } from "@/lib/auth";
import { parseOptionalPublicHttpUrl } from "@/lib/logo";
import { upsertProfile } from "@/lib/profiles";

const MAX_DISPLAY_NAME_LENGTH = 80;

const signInRequired: ActionResult = {
  ok: false,
  message: "Sign in to update your profile.",
};

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const user = await requireAuthUser();

  if (!user) {
    return signInRequired;
  }

  const displayName = formData.get("displayName")?.toString().trim() ?? "";
  const avatarUrlRaw = formData.get("avatarUrl")?.toString().trim() ?? "";

  if (!displayName) {
    return { ok: false, message: "Display name is required.", field: "displayName" };
  }

  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      ok: false,
      message: `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.`,
      field: "displayName",
    };
  }

  try {
    const avatarUrl = avatarUrlRaw
      ? parseOptionalPublicHttpUrl(avatarUrlRaw, "Avatar URL")
      : null;

    await upsertProfile(user.id, { displayName, avatarUrl });
    revalidatePath("/", "layout");
    revalidatePath("/settings");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save profile.",
      field: "avatarUrl",
    };
  }
}
