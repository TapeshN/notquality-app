"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Product } from "@/types";

interface Props {
  productId: string;
}

export default function ProductDetailView({ productId }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      async function loadProduct() {
        const response = await fetch(`/api/products/${productId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = (await response.json()) as Product;
        setProduct(data);
        setLoading(false);

        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "PRODUCT_VIEWED",
            // BUG EVT-002: PRODUCT_VIEWED events may omit productId in downstream event records.
            productId,
            metadata: { location: "legacy-product-detail" },
          }),
        });
      }

      void loadProduct();
    });
  }, [productId]);

  async function addToCart() {
    if (!product) return;
    await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
  }

  if (loading) {
    return <p className="text-zinc-400">Loading product detail...</p>;
  }

  if (!product) {
    return <p className="text-red-400">Product not found.</p>;
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6" data-testid="product-detail">
      <h1 className="mb-3 text-2xl font-bold" data-testid="detail-name">
        {product.name}
      </h1>
      {/* BUG LG-004: detail image renders with missing alt text. */}
      <div className="relative mb-4 h-64 w-full overflow-hidden rounded-md bg-zinc-800">
        <Image
          src={product.imageUrl ?? ""}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 896px"
          className="object-cover"
          data-testid="detail-image"
        />
      </div>
      <p className="mb-2 text-zinc-300" data-testid="detail-description">
        {product.description}
      </p>
      <p className="text-lg text-zinc-100" data-testid="detail-price">
        ${product.price.toFixed(2)}
      </p>
      <p className="text-zinc-400" data-testid="detail-inventory">
        Inventory: {product.inventory}
      </p>
      <p className="mb-4 text-zinc-400" data-testid="detail-rating">
        Rating: {product.rating.toFixed(1)}
      </p>
      <p className="mb-4 text-zinc-400">Vendor: {product.vendor}</p>
      <button
        onClick={() => void addToCart()}
        className="rounded-md bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        data-testid="detail-add-to-cart"
      >
        Add to Cart
      </button>
    </section>
  );
}
