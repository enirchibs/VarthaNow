import { NextResponse } from "next/server";
import { z } from "zod";
import { articles, jobs } from "@/lib/data";

const schema = z.object({
  query: z.string().min(1).max(500),
  language: z.string().default("te")
});

export async function POST(request: Request) {
  const input = schema.safeParse(await request.json());
  if (!input.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const context = {
    headlines: articles.slice(0, 5).map((article) => ({
      category: article.category,
      headline: article.headline.te,
      summary: article.summary.te,
      city: article.city
    })),
    jobs: jobs.slice(0, 4)
  };

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      answer:
        "ఇది డెమో సమాధానం: తాజా అప్డేట్స్‌లో వర్షాల అలర్ట్, ఏపీ సంక్షేమ షెడ్యూల్, విశాఖ IT వాక్-ఇన్‌లు ట్రెండ్ అవుతున్నాయి. OPENAI_API_KEY సెట్ చేస్తే live AI answers వస్తాయి."
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
      input: [
        {
          role: "system",
          content:
            "You are Vartha AI, a Telugu-first regional news assistant. Answer concisely, prefer Telugu unless the user asks otherwise, and cite when an answer comes from provided context. Do not invent exact prices or live scores if not in context."
        },
        {
          role: "user",
          content: JSON.stringify({ query: input.data.query, language: input.data.language, context })
        }
      ]
    })
  });

  if (!response.ok) {
    return NextResponse.json({ answer: "AI service is temporarily unavailable. Please try again." }, { status: 200 });
  }

  const data = await response.json();
  const answer =
    data.output_text ??
    data.output?.flatMap((item: { content?: { text?: string }[] }) => item.content ?? []).map((item: { text?: string }) => item.text).join("\n") ??
    "No answer generated.";

  return NextResponse.json({ answer });
}
