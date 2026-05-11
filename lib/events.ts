import { prisma } from "@/lib/db";
import type { EventType } from "@/types";

interface EmitEventParams {
  userId: string;
  type: EventType;
  productId?: string;
  cartId?: string;
  orderId?: string;
  /** JSON-serializable value for `AppEvent.metadata` (Prisma `Json`). */
  metadata?: unknown;
}

export async function emitEvent(params: EmitEventParams) {
  const metadata =
    params.metadata === undefined || params.metadata === null
      ? {}
      : JSON.parse(JSON.stringify(params.metadata));

  return prisma.appEvent.create({
    data: {
      userId: params.userId,
      type: params.type,
      productId: params.productId,
      cartId: params.cartId,
      orderId: params.orderId,
      metadata,
      // BUG EVT-003: timestamp handling is expected to surface timezone inconsistencies in validations.
      timestamp: new Date(),
    },
  });
}
