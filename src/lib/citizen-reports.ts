import { supabase } from "@/lib/supabase";
import { compressImage, extensionFor } from "@/lib/image-compression";

// Citizen reports (local news / public issues) go to `citizen_reports` as pending;
// editors review them in the admin Review Queue before anything is published.

export const MEDIA_BUCKET = "news-media";
export const MAX_REPORT_FILES = 3;
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024;
export type ReportKind = "news" | "issue";
export type ReportMedia = { url: string; type: "image" | "video" };

export class NotSignedInError extends Error {}

async function upload(path: string, file: Blob) {
  const { error } = await supabase!.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type.split(";")[0], cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function submitCitizenReport(input: {
  kind: ReportKind;
  title: string;
  description: string;
  area: string;
  phone: string;
  files: File[];
  voice: Blob | null;
}): Promise<void> {
  if (!supabase) throw new Error("Service unavailable");
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new NotSignedInError();

  const folder = `reports/${user.id}/${Date.now()}`;
  const media: ReportMedia[] = [];
  for (const [i, original] of input.files.slice(0, MAX_REPORT_FILES).entries()) {
    if (original.type.startsWith("video/")) {
      if (original.size > MAX_VIDEO_BYTES) throw new Error("video too large");
      media.push({ url: await upload(`${folder}/video-${i}.${(original.name.split(".").pop() || "mp4").toLowerCase()}`, original), type: "video" });
    } else {
      const image = await compressImage(original);
      media.push({ url: await upload(`${folder}/photo-${i}.${extensionFor(image)}`, image), type: "image" });
    }
  }
  const voice_url = input.voice ? await upload(`${folder}/voice.${input.voice.type.includes("mp4") ? "m4a" : "webm"}`, input.voice) : null;

  const description = input.description.trim() || (voice_url ? "(వాయిస్ నోట్ ద్వారా పంపబడింది)" : "");
  const { error } = await supabase.from("citizen_reports").insert({
    kind: input.kind,
    title: input.title.trim() || null,
    description,
    area: input.area || null,
    media,
    voice_url,
    reporter_id: user.id,
    reporter_name: (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "").toString().slice(0, 80) || null,
    reporter_phone: input.phone.replace(/\D/g, "").slice(-10) || null,
  });
  if (error) throw new Error(error.message);
}
