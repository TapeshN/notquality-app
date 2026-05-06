import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function LegacyLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "legacy") {
    redirect("/login");
  }

  redirect("/playgrounds/legacy/products");
}
