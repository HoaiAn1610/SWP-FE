import { supabase } from "../config/supabase";

// src/utils/uploadFile.js
export const uploadFile = async (file, folder = "") => {
  if (!file) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // Upload to Supabase
  const { error } = await supabase.storage
    .from("images") // replace with your bucket name
    .upload(filePath, file);

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  // Get public URL
  const { data } = supabase.storage.from("images").getPublicUrl(filePath);

  return data.publicUrl;
};
