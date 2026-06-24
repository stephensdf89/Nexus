import { supabase } from "@/lib/supabase";

export default async function uploadProfilePhoto(base64Image: string, userId: string) {
  const fileName = `pfp-${userId}-${Date.now()}.jpg`;

  const res = await fetch(base64Image);
  const blob = await res.blob();

  const { error } = await supabase.storage
    .from("profile-photos")
    .upload(fileName, blob, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function saveProfilePhotoToDB(userId: string, url: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", userId);

  if (error) {
    console.error(error);
  }
}

export async function saveProfileFields(userId: string, fields: Record<string, unknown>) {
  const { error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", userId);

  if (error) {
    console.error(error);
  }
}