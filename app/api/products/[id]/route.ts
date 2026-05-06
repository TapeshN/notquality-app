import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // BUG API-001: detail endpoint returns salePrice as price when salePrice exists.
  // BUG LG-003: Legacy listing/detail price mismatch comes from this response shape.
  return NextResponse.json({
    ...product,
    price: product.salePrice ?? product.price,
  });
}
