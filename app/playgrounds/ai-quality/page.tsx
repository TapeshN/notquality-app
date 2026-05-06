import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";

export default async function AiQualityLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "ai-quality") {
    redirect("/login");
  }

  return (
    <PlaygroundShell playground="ai-quality">
      <div data-testid="playground-shell">
        <h1 className="text-2xl font-bold mb-2">AI Quality Lab</h1>
        <p className="text-zinc-400">Coming in Phase 6.</p>
      </div>
    </PlaygroundShell>
  );
}
