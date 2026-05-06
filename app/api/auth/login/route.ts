import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAccountByEmail } from "@/lib/accounts";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const account = getAccountByEmail(email);
  if (!account || account.password !== password) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const session = await getSession();
  session.user = { email: user.email, playground: account.playground };
  await session.save();

  return NextResponse.json({ redirect: account.route }, { status: 200 });
}
