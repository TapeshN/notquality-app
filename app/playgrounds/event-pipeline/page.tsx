import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";
import EventPipelineView from "./EventPipelineView";

export default async function EventPipelineLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "event-pipeline") {
    redirect("/login");
  }

  return (
    <PlaygroundShell playground="event-pipeline">
      <div data-testid="playground-shell">
        <h1 className="mb-2 text-2xl font-bold">Event Pipeline Lab</h1>
        <p className="mb-6 text-zinc-400">
          Validate event ingestion, payload shape, and reporting consistency.
        </p>
        <EventPipelineView />
      </div>
    </PlaygroundShell>
  );
}
