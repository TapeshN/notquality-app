import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [
    totalViews,
    totalSearches,
    totalCartAdds,
    totalOrders,
    totalFailures,
  ] = await Promise.all([
    prisma.appEvent.count({ where: { userId: user.id, type: "PRODUCT_VIEWED" } }),
    prisma.appEvent.count({ where: { userId: user.id, type: "PRODUCT_SEARCHED" } }),
    // BUG EVT-001: duplicate events inflate this count
    prisma.appEvent.count({ where: { userId: user.id, type: "ITEM_ADDED_TO_CART" } }),
    prisma.appEvent.count({ where: { userId: user.id, type: "ORDER_SUBMITTED" } }),
    prisma.appEvent.count({ where: { userId: user.id, type: "ORDER_FAILED" } }),
  ]);

  const conversionRate =
    totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(1) : "0.0";

  return NextResponse.json({
    totalViews,
    totalSearches,
    totalCartAdds,
    totalOrders,
    totalFailures,
    conversionRate: parseFloat(conversionRate),
  });
}
