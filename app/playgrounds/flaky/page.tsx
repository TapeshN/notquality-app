import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";
import FlakyLabView from "./FlakyLabView";

export default async function FlakyLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "flaky") {
    redirect("/login");
  }

  return (
    <PlaygroundShell playground="flaky">
      <div data-testid="playground-shell">
        <h1 className="text-2xl font-bold mb-2">Flaky Test Lab</h1>
        <p className="mb-6 text-zinc-400">
          Probe randomized latency, intermittent failures, and UI race conditions.
        </p>
        <FlakyLabView />
      </div>
    </PlaygroundShell>
  );
}
