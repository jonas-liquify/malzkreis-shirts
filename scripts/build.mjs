// Baut die statische Seite nach dist/ und setzt den Cache-Buster (?v=dev → Commit-SHA).
// Läuft automatisch vor jedem `wrangler deploy` (siehe "build" in wrangler.jsonc).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist");
const files = ["index.html", "css", "js", "assets"];

function version() {
  // Workers Builds, GitHub Actions oder lokales Git – sonst Zeitstempel
  const sha = process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA;
  if (sha) return sha.slice(0, 8);
  try { return execSync("git rev-parse --short=8 HEAD", { cwd: root }).toString().trim(); }
  catch { return Date.now().toString(36); }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const f of files) cpSync(join(root, f), join(out, f), { recursive: true });

const v = version();
const htmlPath = join(out, "index.html");
const html = readFileSync(htmlPath, "utf8").replaceAll("?v=dev", `?v=${v}`);
writeFileSync(htmlPath, html);

console.log(`Build fertig: dist/ (Version ${v})`);
