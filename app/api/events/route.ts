import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { emitEvent } from "@/lib/events";
import type { EventType } from "@/types";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, productId, cartId, orderId, metadata } = body;

  if (!type) {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const event = await emitEvent({
    userId: user.id,
    type: type as EventType,
    productId,
    cartId,
    orderId,
    metadata,
  });

  return NextResponse.json(event, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const events = await prisma.appEvent.findMany({
    where: {
      userId: user.id,
      ...(type && { type }),
    },
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return NextResponse.json(events);
}
