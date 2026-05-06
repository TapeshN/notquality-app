import PlaygroundShell from "@/components/playground/PlaygroundShell";
import LegacyNav from "@/components/playground/LegacyNav";
import { requireLegacyUser } from "../_lib/auth";
import ProductsView from "./ProductsView";

export default async function LegacyProductsPage() {
  await requireLegacyUser();

  return (
    <PlaygroundShell playground="legacy">
      <LegacyNav />
      <ProductsView />
    </PlaygroundShell>
  );
}
