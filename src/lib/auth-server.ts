import { cookies } from "next/headers";

export async function getCurrentUser() {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return null;

  return { id: userId };
}
