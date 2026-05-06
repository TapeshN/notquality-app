"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, Order } from "@/types";

interface CartResponse {
  id?: string;
  items?: CartItem[];
}

export default function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  async function loadCart() {
    const response = await fetch("/api/cart/items", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as CartResponse;
    setItems(Array.isArray(data.items) ? data.items : []);
  }

  useEffect(() => {
    void loadCart();
  }, []);

  async function updateQuantity(id: string, quantity: number) {
    await fetch(`/api/cart/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    await loadCart();
  }

  async function removeItem(id: string) {
    await fetch(`/api/cart/items/${id}`, { method: "DELETE" });
    await loadCart();
  }

  async function submitOrder() {
    setSubmitting(true);
    setShowSuccessToast(true);
    // BUG LG-008: success toast is shown before API confirms order status.

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
      });
      if (!response.ok) {
        setShowSuccessToast(false);
      } else {
        await response.json() as Order;
        await loadCart();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.priceAtAdd, 0);
  }, [items]);

  return (
    // BUG LG-007: cart panel does not trap focus, allowing tab navigation to escape.
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5" data-testid="cart-container">
      <h1 className="mb-4 text-2xl font-bold">Cart</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3"
            data-testid="cart-item"
          >
            <p className="font-medium text-zinc-100" data-testid="cart-item-name">
              {item.product?.name ?? "Unknown product"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="text-sm text-zinc-400">
                Qty
                <input
                  type="number"
                  min={0}
                  value={item.quantity}
                  onChange={(event) => void updateQuantity(item.id, Number(event.target.value))}
                  className="ml-2 w-20 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
                  data-testid="cart-item-quantity"
                />
                {/* BUG LG-010: quantity input accepts 0 with no client-side validation. */}
              </label>
              <span className="text-sm text-zinc-300" data-testid="cart-item-price">
                ${item.priceAtAdd.toFixed(2)} each
              </span>
              <span className="text-sm text-zinc-100" data-testid="cart-item-total">
                ${(item.priceAtAdd * item.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => void removeItem(item.id)}
                className="ml-auto rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:text-white"
                data-testid="cart-item-remove"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
        <p className="text-lg font-semibold text-zinc-100" data-testid="cart-total">
          Total: ${total.toFixed(2)}
        </p>
        <button
          onClick={() => void submitOrder()}
          disabled={submitting || items.length === 0}
          className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
          data-testid="submit-order-btn"
        >
          {submitting ? "Submitting..." : "Submit Order"}
        </button>
      </div>

      {showSuccessToast ? (
        <div
          className="mt-4 rounded-md border border-emerald-700 bg-emerald-900/30 px-3 py-2 text-sm text-emerald-300"
          data-testid="order-success-toast"
        >
          Order submitted successfully.
        </div>
      ) : null}
    </section>
  );
}
