"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { Order } from "@/types";

export default function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sortAsc, setSortAsc] = useState(false);

  async function loadOrders() {
    const response = await fetch("/api/orders", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as Order[];
    setOrders(data);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadOrders();
    });
  }, []);

  const sortedOrders = useMemo(() => {
    const clone = [...orders];
    clone.sort((a, b) => {
      if (!sortAsc) return 0;
      // BUG LG-006: sorts alphabetically by date string, not by date value.
      return a.createdAt.localeCompare(b.createdAt);
    });
    return clone;
  }, [orders, sortAsc]);

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <h1 className="mb-4 text-2xl font-bold">Orders</h1>
      <table className="w-full border-collapse text-left" data-testid="orders-table">
        <thead>
          <tr className="border-b border-zinc-800 text-sm text-zinc-400">
            <th className="py-2">Order</th>
            <th className="py-2">
              <button
                onClick={() => setSortAsc((value) => !value)}
                className="hover:text-zinc-200"
                data-testid="order-sort-date"
              >
                Date
              </button>
            </th>
            <th className="py-2">Status</th>
            <th className="py-2">Total</th>
            <th className="py-2">Items</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => (
            <Fragment key={order.id}>
              <tr
                className="cursor-pointer border-b border-zinc-800/50 text-sm text-zinc-200"
                data-testid="order-row"
                onClick={() =>
                  setExpanded((current) => ({ ...current, [order.id]: !current[order.id] }))
                }
              >
                <td className="py-2" data-testid="order-id">
                  {order.id.slice(0, 8)}
                </td>
                <td className="py-2" data-testid="order-date">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="py-2" data-testid="order-status">
                  {order.status}
                </td>
                <td className="py-2" data-testid="order-total">
                  ${order.total.toFixed(2)}
                </td>
                <td className="py-2">{order.items.length}</td>
              </tr>
              {expanded[order.id] ? (
                <tr key={`${order.id}-expanded`} className="border-b border-zinc-800/50">
                  <td className="pb-3 text-xs text-zinc-400" colSpan={5}>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id}>
                          {item.product?.name ?? item.productId} x{item.quantity} @ $
                          {item.price.toFixed(2)}
                        </p>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </section>
  );
}
