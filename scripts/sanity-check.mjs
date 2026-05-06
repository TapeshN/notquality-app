import { existsSync, readFileSync } from "node:fs";

const requiredPaths = [
  "prisma/schema.prisma",
  "data/seed/accounts.json",
  "data/seed/products.json",
];

for (const path of requiredPaths) {
  if (!existsSync(path)) {
    console.error(`Missing required setup artifact: ${path}`);
    process.exit(1);
  }
}

const accounts = JSON.parse(readFileSync("data/seed/accounts.json", "utf8"));
const products = JSON.parse(readFileSync("data/seed/products.json", "utf8"));

if (!Array.isArray(accounts) || accounts.length === 0) {
  console.error("Seed sanity check failed: accounts.json is empty.");
  process.exit(1);
}

if (!Array.isArray(products) || products.length === 0) {
  console.error("Seed sanity check failed: products.json is empty.");
  process.exit(1);
}

console.log("Sanity check passed.");
