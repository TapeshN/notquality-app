import PlaygroundShell from "@/components/playground/PlaygroundShell";
import LegacyNav from "@/components/playground/LegacyNav";
import { requireLegacyUser } from "../_lib/auth";
import DashboardView from "./DashboardView";

export default async function LegacyDashboardPage() {
  await requireLegacyUser();

  return (
    <PlaygroundShell playground="legacy">
      <LegacyNav />
      <DashboardView />
    </PlaygroundShell>
  );
}
