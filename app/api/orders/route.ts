import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { emitEvent } from "@/lib/events";

export async function POST() {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const cart = await prisma.cart.findFirst({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0
  );

  // BUG EVT-005: ORDER_SUBMITTED fires before checking if order actually succeeds
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "CONFIRMED",
      total,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.priceAtAdd,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  // BUG API-005: ORDER_SUBMITTED always emitted even if inventory check fails
  await emitEvent({
    userId: user.id,
    type: "ORDER_SUBMITTED",
    orderId: order.id,
    metadata: { total, itemCount: cart.items.length },
  });

  // BUG API-006: inventory not checked — can go negative
  for (const item of cart.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { inventory: { decrement: item.quantity } },
    });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json(order, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
