import { createClient } from "@/lib/supabase/server";
import { mapProfileRow, type ProfileRow } from "@/lib/supabase/types";
import type { UserProfile } from "@/lib/types";

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapProfileRow(data as ProfileRow);
}

export async function getProfilesByIds(
  userIds: string[],
): Promise<Map<string, UserProfile>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, updated_at")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  const profiles = new Map<string, UserProfile>();

  for (const row of (data ?? []) as ProfileRow[]) {
    profiles.set(row.id, mapProfileRow(row));
  }

  return profiles;
}

export async function upsertProfile(
  userId: string,
  input: { displayName: string; avatarUrl: string | null },
) {
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    display_name: input.displayName,
    avatar_url: input.avatarUrl,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export function attachContributors<
  T extends { createdBy: string | null; updatedBy: string | null },
>(
  items: T[],
  profiles: Map<string, UserProfile>,
): (T & { contributor: UserProfile | null; editor: UserProfile | null })[] {
  return items.map((item) => ({
    ...item,
    contributor: item.createdBy ? (profiles.get(item.createdBy) ?? null) : null,
    editor: item.updatedBy ? (profiles.get(item.updatedBy) ?? null) : null,
  }));
}
