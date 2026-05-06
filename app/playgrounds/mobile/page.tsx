import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";
import MobileLabView from "./MobileLabView";

export default async function MobileLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "mobile") {
    redirect("/login");
  }

  return (
    <PlaygroundShell playground="mobile">
      <div data-testid="playground-shell">
        <h1 className="text-2xl font-bold mb-2">Mobile & Responsive Lab</h1>
        <p className="mb-6 text-zinc-400">
          Validate viewport behavior, touch affordances, and responsive layout stability.
        </p>
        <MobileLabView />
      </div>
    </PlaygroundShell>
  );
}
