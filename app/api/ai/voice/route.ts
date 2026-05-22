import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  text: z.string().min(1).max(4000),
  voice: z.string().default("alloy")
});

export async function POST(request: Request) {
  const input = schema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is required for voice generation" }, { status: 501 });
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_VOICE_MODEL ?? "tts-1",
      voice: input.data.voice,
      input: input.data.text
    })
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Voice generation failed" }, { status: 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
