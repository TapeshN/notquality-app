import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { EventType } from "@/types";

interface EmitEventParams {
  userId: string;
  type: EventType;
  productId?: string;
  cartId?: string;
  orderId?: string;
  metadata?: Prisma.InputJsonValue;
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
      // BUG EVT-003: timestamp handling is expected to surface timezone inconsistencies in validations.
      timestamp: new Date(),
    },
  });
}
