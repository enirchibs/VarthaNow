import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  headline: z.string().min(1),
  text: z.string().min(20),
  language: z.string().default("te")
});

export async function POST(request: Request) {
  const input = schema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      tenSecond: "త్వరిత సారాంశం అందుబాటులో ఉంది.",
      oneMinute: input.data.text.slice(0, 360),
      fullExplanation: input.data.text
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL ?? "gpt-4o-mini",
      input: `Summarize this news for VarthaNow in ${input.data.language}. Return JSON with tenSecond, oneMinute, fullExplanation. Headline: ${input.data.headline}\n\n${input.data.text}`
    })
  });

  const data = await response.json();
  return NextResponse.json({ raw: data.output_text ?? data });
}
