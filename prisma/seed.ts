import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const accounts = JSON.parse(readFileSync(join(__dirname, "../data/seed/accounts.json"), "utf-8"));
const products = JSON.parse(readFileSync(join(__dirname, "../data/seed/products.json"), "utf-8"));

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding users...");
  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        email: account.email,
        password: account.password,
        playground: account.playground,
      },
    });
  }

  console.log("Seeding products...");
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        imageUrl: product.imageUrl,
        price: product.price,
        salePrice: product.salePrice,
        inventory: product.inventory,
        rating: product.rating,
        vendor: product.vendor,
        active: product.active,
      },
    });
  }

  console.log("Seeding metrics...");
  const metricKeys = [
    "total_products_viewed",
    "total_searches",
    "total_cart_adds",
    "total_orders",
    "total_order_failures",
    "conversion_rate",
  ];
  for (const key of metricKeys) {
    await prisma.metric.upsert({
      where: { key },
      update: {},
      create: { key, value: 0 },
    });
  }

  console.log("Seeding challenges...");
  await prisma.challenge.upsert({
    where: { slug: "legacy-bug-hunt-1" },
    update: {},
    create: {
      slug: "legacy-bug-hunt-1",
      title: "Legacy Shop: Product Listing Bugs",
      description:
        "The NotQuality Shop product listing page has several quality issues. Use the Legacy App Lab to find and report as many bugs as you can. You have access to the full shopping flow: product list, detail pages, cart, and orders.",
      playground: "legacy",
      bugIds: ["LG-001", "LG-002", "LG-003", "LG-004", "LG-005"],
      difficulty: "beginner",
      active: true,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
