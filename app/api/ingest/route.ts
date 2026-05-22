import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  sourceId: z.string().optional(),
  dryRun: z.boolean().default(false)
});

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = schema.safeParse(await request.json().catch(() => ({})));
  if (!input.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  return NextResponse.json({
    ok: true,
    dryRun: input.data.dryRun,
    pipeline: ["scrape", "dedupe", "summarize", "translate", "categorize", "moderate", "publish"],
    note: "Wire this route to Supabase Edge Function ingest-news for scheduled production jobs."
  });
}
