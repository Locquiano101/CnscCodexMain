// Migration script: copy legacy files from <repo>/public/<orgId>/... to <repo>/server/uploads/<orgId>/...
// Matches the fallback logic in src/server.js, which checks ../../public (legacy) then ../uploads (primary)
// Usage:
//   node scripts/migrate-uploads.js            # normal run (no overwrite)
//   node scripts/migrate-uploads.js --dry-run  # simulate only
//   node scripts/migrate-uploads.js --overwrite # overwrite destination files if they exist

import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import fsp from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run") || process.env.DRY_RUN === "1";
const OVERWRITE = args.has("--overwrite") || process.env.OVERWRITE === "1";

const LEGACY_PUBLIC_DIR = path.resolve(__dirname, "../../public");
const UPLOADS_DIR = path.resolve(__dirname, "../uploads");

async function exists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  if (await exists(dir)) return;
  if (DRY_RUN) return; // don't create in dry-run
  await fsp.mkdir(dir, { recursive: true });
}

async function copyFileSafe(src, dest) {
  const destDir = path.dirname(dest);
  await ensureDir(destDir);

  if (!OVERWRITE && (await exists(dest))) {
    return { copied: false, reason: "exists" };
  }
  if (DRY_RUN) return { copied: true, dryRun: true };

  await fsp.copyFile(src, dest);
  return { copied: true };
}

async function copyDirRecursive(srcDir, dstDir, counters) {
  const entries = await fsp.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const dstPath = path.join(dstDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, dstPath, counters);
    } else if (entry.isFile()) {
      const result = await copyFileSafe(srcPath, dstPath);
      counters.total++;
      if (result.copied) counters.copied++;
      if (result.reason === "exists") counters.skippedExists++;
    }
  }
}

async function migrate() {
  console.log("\n=== CNSC Codex uploads migration ===");
  console.log(`Legacy source: ${LEGACY_PUBLIC_DIR}`);
  console.log(`Destination  : ${UPLOADS_DIR}`);
  console.log(`Options      : ${DRY_RUN ? "DRY-RUN " : ""}${OVERWRITE ? "OVERWRITE" : "NO-OVERWRITE"}`);

  if (!(await exists(LEGACY_PUBLIC_DIR))) {
    console.warn("Legacy public directory not found. Nothing to migrate.");
    console.warn("Expected at ../../public relative to server/scripts/.");
    return;
  }

  await ensureDir(UPLOADS_DIR);

  const orgEntries = await fsp.readdir(LEGACY_PUBLIC_DIR, { withFileTypes: true });
  const counters = { orgs: 0, total: 0, copied: 0, skippedExists: 0 };

  for (const entry of orgEntries) {
    if (!entry.isDirectory()) continue;
    const orgId = entry.name;
    const srcOrgDir = path.join(LEGACY_PUBLIC_DIR, orgId);
    const dstOrgDir = path.join(UPLOADS_DIR, orgId);
    counters.orgs++;
    console.log(`\n→ Migrating org ${orgId}`);
    await copyDirRecursive(srcOrgDir, dstOrgDir, counters);
  }

  console.log("\n=== Summary ===");
  console.log(`Organizations processed : ${counters.orgs}`);
  console.log(`Files seen              : ${counters.total}`);
  console.log(`Files copied            : ${counters.copied}${DRY_RUN ? " (dry-run)" : ""}`);
  console.log(`Files skipped (exists)  : ${counters.skippedExists}`);
  console.log("Done.\n");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
