import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Load .env
try {
  const envText = fs.readFileSync(".env", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && value) process.env[key] = value;
  }
} catch {}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const leonardoKey = process.env.LEONARDO_API_KEY || "caa189c3-0676-41f4-9095-11c7eac9ca28";

const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
const generationId = "1f15e56d-c465-6030-a83c-89bc3b05118f";

async function checkStatus() {
  console.log("Checking status of generation ID:", generationId);
  const pollRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
    headers: {
      "Authorization": `Bearer ${leonardoKey}`,
      "Accept": "application/json"
    }
  });
  
  if (!pollRes.ok) {
    console.error("Failed to poll status:", pollRes.status, await pollRes.text());
    return;
  }
  
  const pollData = await pollRes.json();
  const generation = pollData.generations_by_pk;
  
  if (generation) {
    console.log("Current Status:", generation.status);
    if (generation.status === "COMPLETE") {
      const imageUrl = generation.generated_images?.[0]?.url;
      console.log("Image URL:", imageUrl);
      
      // Upload to Supabase
      console.log("Uploading to Supabase Storage...");
      const imgRes = await fetch(imageUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `${Date.now()}-gpt2-final.jpg`;
      const filePath = `article-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(filePath, buffer, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
      } else {
        const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(filePath);
        console.log("🎉 SUCCESS! Upgraded Image public URL:", urlData.publicUrl);
      }
    } else {
      console.log("Generation is still processing or failed.");
    }
  } else {
    console.error("No generation details found in response.");
  }
}

checkStatus().catch(console.error);
