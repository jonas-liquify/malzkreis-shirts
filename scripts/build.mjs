// Baut die statische Seite nach dist/ und setzt den Cache-Buster (?v=dev → Commit-SHA).
// Läuft automatisch vor jedem `wrangler deploy` (siehe "build" in wrangler.jsonc).
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist");
const files = ["index.html", "shop", "css", "js", "assets"];

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
const htmlFiles = readdirSync(out, { recursive: true }).filter((f) => f.endsWith(".html"));
for (const f of htmlFiles) {
  const path = join(out, f);
  writeFileSync(path, readFileSync(path, "utf8").replaceAll("?v=dev", `?v=${v}`));
}

console.log(`Build fertig: dist/ (Version ${v}, ${htmlFiles.length} Seiten)`);
