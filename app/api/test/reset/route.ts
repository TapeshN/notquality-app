import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import products from "@/data/seed/products.json";
import type { PlaygroundId } from "@/types";

const PLAYGROUNDS: PlaygroundId[] = [
  "legacy",
  "api-services",
  "event-pipeline",
  "ai-quality",
  "flaky",
  "accessibility",
  "release-risk",
];

const INVENTORY_MAP = (products as Array<{ id: string; inventory: number }>).reduce<
  Record<string, number>
>((acc, product) => {
  acc[product.id] = product.inventory;
  return acc;
}, {});

async function restoreInventoryFromSeedAndRemainingOrders() {
  for (const [id, inventory] of Object.entries(INVENTORY_MAP)) {
    await prisma.product.update({ where: { id }, data: { inventory } });
  }

  const orderedQuantities = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
  });

  for (const entry of orderedQuantities) {
    const ordered = entry._sum.quantity ?? 0;
    if (!INVENTORY_MAP[entry.productId] || ordered <= 0) {
      continue;
    }

    await prisma.product.update({
      where: { id: entry.productId },
      data: { inventory: { decrement: ordered } },
    });
  }
}

async function resetAllData() {
  await prisma.appEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();

  await restoreInventoryFromSeedAndRemainingOrders();
  await prisma.metric.updateMany({ data: { value: 0 } });

  return {
    scope: "all",
    resetInventory: true,
    resetMetrics: true,
  };
}

async function resetPlaygroundData(playground: PlaygroundId) {
  const users = await prisma.user.findMany({
    where: { playground },
    select: { id: true },
  });
  const userIds = users.map((user) => user.id);

  if (userIds.length === 0) {
    return {
      scope: playground,
      affectedUsers: 0,
      deletedEvents: 0,
      deletedOrders: 0,
      deletedCarts: 0,
      resetInventory: true,
    };
  }

  const deletedEvents = await prisma.appEvent.deleteMany({
    where: { userId: { in: userIds } },
  });

  const orders = await prisma.order.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length > 0) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
  }
  const deletedOrders = await prisma.order.deleteMany({
    where: { id: { in: orderIds } },
  });

  const carts = await prisma.cart.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const cartIds = carts.map((cart) => cart.id);

  if (cartIds.length > 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: { in: cartIds } } });
  }
  const deletedCarts = await prisma.cart.deleteMany({
    where: { id: { in: cartIds } },
  });

  await restoreInventoryFromSeedAndRemainingOrders();

  return {
    scope: playground,
    affectedUsers: userIds.length,
    deletedEvents: deletedEvents.count,
    deletedOrders: deletedOrders.count,
    deletedCarts: deletedCarts.count,
    resetInventory: true,
  };
}

// Test utility endpoint — resets user data to a clean seeded state.
// Only available in non-production environments.
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const rawPlayground = body?.playground;
  const playground =
    typeof rawPlayground === "string" && rawPlayground.length > 0 ? rawPlayground : null;

  if (!playground) {
    const result = await resetAllData();
    return NextResponse.json({ ok: true, reset: true, ...result });
  }

  if (!PLAYGROUNDS.includes(playground as PlaygroundId)) {
    return NextResponse.json({ error: "Invalid playground" }, { status: 400 });
  }

  const result = await resetPlaygroundData(playground as PlaygroundId);
  return NextResponse.json({ ok: true, reset: true, ...result });
}
