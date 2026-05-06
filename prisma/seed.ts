import { PrismaClient } from "@prisma/client";
import accounts from "../data/seed/accounts.json";
import products from "../data/seed/products.json";

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

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
