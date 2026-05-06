import { prisma } from "@/lib/db";
import type { EventType } from "@/types";

interface EmitEventParams {
  userId: string;
  type: EventType;
  productId?: string;
  cartId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}

export async function emitEvent(params: EmitEventParams) {
  return prisma.appEvent.create({
    data: {
      userId: params.userId,
      type: params.type,
      productId: params.productId,
      cartId: params.cartId,
      orderId: params.orderId,
      metadata: params.metadata ?? {},
      timestamp: new Date(),
    },
  });
}
