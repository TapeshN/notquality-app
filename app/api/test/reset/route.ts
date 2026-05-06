import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Test utility endpoint — resets user data to a clean seeded state.
// Only available in non-production environments.
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  await prisma.appEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();

  // Reset inventory to seeded values
  const inventoryMap: Record<string, number> = {
    "prod-001": 42,
    "prod-002": 15,
    "prod-003": 8,
    "prod-004": 67,
    "prod-005": 23,
    "prod-006": 0,
    "prod-007": 54,
    "prod-008": 112,
    "prod-009": 31,
    "prod-010": 3,
  };

  for (const [id, inventory] of Object.entries(inventoryMap)) {
    await prisma.product.update({ where: { id }, data: { inventory } });
  }

  await prisma.metric.updateMany({ data: { value: 0 } });

  return NextResponse.json({ ok: true, reset: true });
}
