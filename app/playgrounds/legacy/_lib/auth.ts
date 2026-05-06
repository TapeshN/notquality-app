import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function requireLegacyUser() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "legacy") {
    redirect("/login");
  }
}
