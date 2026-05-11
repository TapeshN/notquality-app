import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { emitEvent } from "@/lib/events";

export async function GET() {
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

  return NextResponse.json(cart ?? { items: [] });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity } = await req.json();

  // BUG API-003: no validation — accepts quantity <= 0
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let cart = await prisma.cart.findFirst({ where: { userId: user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } });
  }

  // BUG API-004: always creates new row instead of incrementing quantity
  const item = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity: quantity ?? 1,
      priceAtAdd: product.price, // BUG EVT-004: always uses base price, never sale price
    },
    include: { product: true },
  });

  // BUG EVT-001: emits event twice by calling emitEvent here and in a duplicate middleware
  await emitEvent({
    userId: user.id,
    type: "ITEM_ADDED_TO_CART",
    productId,
    cartId: cart.id,
    metadata: {
      quantity: quantity ?? 1,
      source: "legacy-shop",
      priceAtTimeOfAdd: product.price,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
