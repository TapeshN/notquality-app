import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";

export default async function AccessibilityLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "accessibility") {
    redirect("/login");
  }

  return (
    <PlaygroundShell playground="accessibility">
      <div data-testid="playground-shell">
        <h1 className="text-2xl font-bold mb-2">Accessibility Lab</h1>
        <p className="text-zinc-400">Coming in Phase 5.</p>
      </div>
    </PlaygroundShell>
  );
}
