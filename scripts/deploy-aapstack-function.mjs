// Deploy a function from supabase/aapstack-functions/<slug>.js to the VaartaNow project on aapstack.tech.
//   ODB_PAT=odb_pat_... node scripts/deploy-aapstack-function.mjs gemini-proxy [--jwt] [--timeout=60000] [--memory=256]
// Set secrets once (values never shown again):
//   ODB_PAT=odb_pat_... node scripts/deploy-aapstack-function.mjs --secret GEMINI_API_KEY   (value read from .env)
import fs from "node:fs";

const PROJECT = "e027be62-50a9-4e4d-9341-afc64689762b";
const API = "https://aapstack.tech/api";
const pat = process.env.ODB_PAT;
if (!pat) throw new Error("Set ODB_PAT (an aapstack personal access token)");
const H = { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" };
const arg = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1] ?? d;

if (process.argv.includes("--secret")) {
  const name = process.argv[process.argv.indexOf("--secret") + 1];
  const line = fs.readFileSync(".env", "utf8").split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
  const value = line?.slice(name.length + 1).trim().replace(/^['"]|['"]$/g, "");
  if (!value) throw new Error(`${name} is not in .env`);
  const r = await fetch(`${API}/secrets`, { method: "POST", headers: H, body: JSON.stringify({ project_id: PROJECT, name, value }) });
  console.log(name, r.status, (await r.text()).slice(0, 200));
  process.exit(0);
}

const slug = process.argv[2];
const code = fs.readFileSync(`supabase/aapstack-functions/${slug}.js`, "utf8");
const r = await fetch(`${API}/projects/${PROJECT}/functions`, {
  method: "POST",
  headers: H,
  body: JSON.stringify({
    slug, code,
    timeout_ms: Number(arg("timeout", 60000)),
    memory_mb: Number(arg("memory", 256)),
    // like Supabase with the anon key: the site may call it without a signed-in user unless --jwt
    verify_jwt: process.argv.includes("--jwt"),
  }),
});
console.log(slug, r.status, (await r.text()).slice(0, 300));
