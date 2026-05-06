import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BUG_DATA_DIR = join(ROOT, "data", "bugs");
const SCAN_DIRS = ["app", "components", "lib", "prisma", "types"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "coverage"]);
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md"]);

function walkFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) {
        files.push(...walkFiles(fullPath));
      }
      continue;
    }

    const dot = entry.lastIndexOf(".");
    const ext = dot >= 0 ? entry.slice(dot) : "";
    if (EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectBugIds() {
  const files = readdirSync(BUG_DATA_DIR).filter((name) => name.endsWith(".json"));
  const ids = [];

  for (const fileName of files) {
    const fullPath = join(BUG_DATA_DIR, fileName);
    const parsed = JSON.parse(readFileSync(fullPath, "utf8"));
    for (const entry of parsed) {
      if (entry?.id) {
        ids.push(String(entry.id));
      }
    }
  }

  return ids;
}

function hasBugComment(contents, bugId) {
  const normalized = bugId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`BUG\\s+${normalized}`);
  return pattern.test(contents);
}

const bugIds = collectBugIds();
const sourceFiles = SCAN_DIRS.flatMap((dir) => walkFiles(join(ROOT, dir)));
const sourceContents = sourceFiles.map((file) => readFileSync(file, "utf8"));

const missing = [];

for (const bugId of bugIds) {
  const found = sourceContents.some((contents) => hasBugComment(contents, bugId));
  if (!found) {
    missing.push(bugId);
  }
}

if (missing.length > 0) {
  console.error("Bug registry validation failed.");
  console.error("Missing BUG comments for ids:");
  for (const bugId of missing) {
    console.error(`- ${bugId}`);
  }
  process.exit(1);
}

console.log(`Bug registry validation passed (${bugIds.length} ids checked).`);
