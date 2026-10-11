import * as fs from "fs";
import * as http from "http";

// ═══════════════════════════════════════════════════════════════════
//  One-time: connect the VaartaNow YouTube channel for uploads.
//
//  1. Put YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET (Google Cloud → OAuth client, type "Desktop app")
//     in .env
//  2. npx tsx scripts/youtube-auth.ts
//  3. Open the printed link, sign in with the Google account that owns the VaartaNow channel, allow access.
//  4. Copy the printed YOUTUBE_REFRESH_TOKEN into GitHub → Settings → Secrets → Actions
//     (with YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET).
// ═══════════════════════════════════════════════════════════════════

for (const line of fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split(/\r?\n/) : []) {
  const i = line.indexOf("=");
  if (i > 0 && !line.trim().startsWith("#")) process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
}
const { YOUTUBE_CLIENT_ID: id, YOUTUBE_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) throw new Error("Add YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET to .env first");

const PORT = 8765;
const redirect = `http://127.0.0.1:${PORT}`;
// upload videos + read their processing status (no permission to delete or change the channel)
const scope = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"].join(" ");
const url = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: id, redirect_uri: redirect, response_type: "code", scope, access_type: "offline", prompt: "consent",
})}`;

console.log(`\nOpen this link, sign in with the account that owns the VaartaNow channel and allow access:\n\n${url}\n`);

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url ?? "/", redirect).searchParams.get("code");
  if (!code) { res.end("Waiting for Google sign-in…"); return; }
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: redirect, grant_type: "authorization_code" }),
  });
  const j: any = await r.json();
  if (!j.refresh_token) {
    res.end(`Failed: ${j.error_description ?? j.error ?? "no refresh token"}`);
    console.error("Failed:", j);
  } else {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h2>VaartaNow YouTube connected ✔</h2><p>You can close this tab and go back to the terminal.</p>");
    console.log(`\nConnected. Add this as a GitHub Actions secret:\n\nYOUTUBE_REFRESH_TOKEN=${j.refresh_token}\n`);
  }
  server.close();
});
server.listen(PORT, "127.0.0.1");
