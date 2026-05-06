import PlaygroundShell from "@/components/playground/PlaygroundShell";
import LegacyNav from "@/components/playground/LegacyNav";
import { requireLegacyUser } from "../_lib/auth";
import OrdersView from "./OrdersView";

export default async function LegacyOrdersPage() {
  await requireLegacyUser();

  return (
    <PlaygroundShell playground="legacy">
      <LegacyNav />
      <OrdersView />
    </PlaygroundShell>
  );
}
