import PlaygroundShell from "@/components/playground/PlaygroundShell";
import LegacyNav from "@/components/playground/LegacyNav";
import { requireLegacyUser } from "../../_lib/auth";
import ProductDetailView from "./ProductDetailView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LegacyProductDetailPage({ params }: Props) {
  await requireLegacyUser();
  const { id } = await params;

  return (
    <PlaygroundShell playground="legacy">
      <LegacyNav />
      <ProductDetailView productId={id} />
    </PlaygroundShell>
  );
}
