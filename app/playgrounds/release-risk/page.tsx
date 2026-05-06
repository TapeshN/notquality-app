import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";

export default async function ReleaseRiskLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "release-risk") {
    redirect("/login");
  }

  return (
    <PlaygroundShell playground="release-risk">
      <div data-testid="playground-shell">
        <h1 className="text-2xl font-bold mb-2">Release Risk Lab</h1>
        <p className="text-zinc-400">Coming in Phase 7.</p>
      </div>
    </PlaygroundShell>
  );
}
