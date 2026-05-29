import { createClient } from "@/lib/supabase/server";

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAuthUser() {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  return user;
}
