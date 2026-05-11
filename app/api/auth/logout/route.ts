import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  session.destroy();
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL("/", origin));
}
