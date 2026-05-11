import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const challenge = await prisma.challenge.findUnique({ where: { slug } });

  if (!challenge || !challenge.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Never expose bugIds — that is the answer key
  const { bugIds, ...publicChallenge } = challenge;
  void bugIds;
  return NextResponse.json(publicChallenge);
}
