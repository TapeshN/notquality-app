import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";
import AccessibilityLabView from "./AccessibilityLabView";

export default async function AccessibilityLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "accessibility") {
    redirect("/login");
  }

  return (
    <PlaygroundShell playground="accessibility">
      <div data-testid="playground-shell">
        <h1 className="text-2xl font-bold mb-2">Accessibility Lab</h1>
        <p className="mb-6 text-zinc-400">
          Deliberate WCAG violations for accessibility tooling and keyboard audits.
        </p>
        <AccessibilityLabView />
      </div>
    </PlaygroundShell>
  );
}
