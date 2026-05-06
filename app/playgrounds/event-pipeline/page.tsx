import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";

export default async function EventPipelineLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "event-pipeline") {
    redirect("/login");
  }

  return (
    <PlaygroundShell playground="event-pipeline">
      <div data-testid="playground-shell">
        <h1 className="text-2xl font-bold mb-2">Event Pipeline Lab</h1>
        <p className="text-zinc-400">Coming in Phase 4.</p>
      </div>
    </PlaygroundShell>
  );
}
