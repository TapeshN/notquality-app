import PlaygroundShell from "@/components/playground/PlaygroundShell";
import LegacyNav from "@/components/playground/LegacyNav";
import { requireLegacyUser } from "../_lib/auth";
import CartView from "./CartView";

export default async function LegacyCartPage() {
  await requireLegacyUser();

  return (
    <PlaygroundShell playground="legacy">
      <LegacyNav />
      <CartView />
    </PlaygroundShell>
  );
}
