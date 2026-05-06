import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");

  // BUG API-002: inactive products are not filtered out
  const products = await prisma.product.findMany({
    where: {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      // BUG API-007: category filter is case-sensitive, response uses title case
      ...(category && { category }),
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(products);
}
