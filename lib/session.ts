import { getIronSession, IronSessionData } from "iron-session";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types";

declare module "iron-session" {
  interface IronSessionData {
    user?: SessionUser;
  }
}

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "notquality_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<IronSessionData>(cookieStore, sessionOptions);
}
