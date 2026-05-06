import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";
import PerformanceLabView from "./PerformanceLabView";

export default async function PerformanceLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "performance") {
    redirect("/login");
  }

  return (
    <PlaygroundShell playground="performance">
      <div data-testid="playground-shell">
        <h1 className="text-2xl font-bold mb-2">Performance Lab</h1>
        <p className="mb-6 text-zinc-400">
          Validate Core Web Vitals, endpoint latency, rendering stability, and runtime health.
        </p>
        <PerformanceLabView />
      </div>
    </PlaygroundShell>
  );
}
