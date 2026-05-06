import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";
import ReleaseRiskView from "./ReleaseRiskView";

export default async function ReleaseRiskLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "release-risk") {
    redirect("/login");
  }

  return (
    <PlaygroundShell playground="release-risk">
      <div data-testid="playground-shell">
        <h1 className="text-2xl font-bold mb-2">Release Risk Lab</h1>
        <p className="mb-6 text-zinc-400">
          Aggregate quality signals across labs into a release confidence recommendation.
        </p>
        <ReleaseRiskView />
      </div>
    </PlaygroundShell>
  );
}
