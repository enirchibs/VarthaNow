import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  text: z.string().min(1),
  targetLanguage: z.string().default("te")
});

export async function POST(request: Request) {
  const input = schema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ translatedText: input.data.text });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL ?? "gpt-4o-mini",
      input: `Translate this for a news app into ${input.data.targetLanguage}. Preserve names and numbers.\n\n${input.data.text}`
    })
  });

  const data = await response.json();
  return NextResponse.json({ translatedText: data.output_text ?? input.data.text });
}
