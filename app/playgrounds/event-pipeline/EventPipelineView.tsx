"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppEvent, EventType } from "@/types";

interface ReportsPayload {
  totalViews: number;
  totalSearches: number;
  totalCartAdds: number;
  totalOrders: number;
  totalFailures: number;
  conversionRate: number;
}

const EVENT_TYPES: EventType[] = [
  "PRODUCT_VIEWED",
  "PRODUCT_SEARCHED",
  "PRODUCT_FILTER_APPLIED",
  "ITEM_ADDED_TO_CART",
  "CART_QUANTITY_UPDATED",
  "ORDER_SUBMITTED",
  "ORDER_FAILED",
];

export default function EventPipelineView() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [reports, setReports] = useState<ReportsPayload | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [manualType, setManualType] = useState<EventType>("PRODUCT_SEARCHED");
  const [manualMetadata, setManualMetadata] = useState('{"source":"event-pipeline-lab"}');
  const [loading, setLoading] = useState(false);

  async function loadEvents(type: string) {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (type) params.set("type", type);

    const response = await fetch(`/api/events?${params.toString()}`, { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as AppEvent[];
      setEvents(data);
    }
    setLoading(false);
  }

  async function loadReports() {
    const response = await fetch("/api/reports", { cache: "no-store" });
    if (response.ok) {
      setReports((await response.json()) as ReportsPayload);
    }
  }

  async function refreshAll(type: string) {
    await Promise.all([loadEvents(type), loadReports()]);
  }

  useEffect(() => {
    void refreshAll("");
  }, []);

  async function applyFilter(type: string) {
    setFilterType(type);
    await loadEvents(type);
  }

  async function emitManualEvent() {
    let metadata: Record<string, unknown> = {};
    try {
      metadata = JSON.parse(manualMetadata) as Record<string, unknown>;
    } catch {
      metadata = { rawMetadata: manualMetadata };
    }

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: manualType,
        metadata,
      }),
    });

    await refreshAll(filterType);
  }

  const recentCounts = useMemo(() => {
    return events.reduce<Record<string, number>>((acc, event) => {
      acc[event.type] = (acc[event.type] ?? 0) + 1;
      return acc;
    }, {});
  }, [events]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4" data-testid="event-trigger-panel">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-zinc-500">Manual Event Trigger</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[220px_1fr_auto]">
          <select
            value={manualType}
            onChange={(event) => setManualType(event.target.value as EventType)}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
            data-testid="event-type-select"
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            value={manualMetadata}
            onChange={(event) => setManualMetadata(event.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            data-testid="event-metadata-input"
          />
          <button
            onClick={() => void emitManualEvent()}
            className="rounded-md bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900"
            data-testid="event-emit-btn"
          >
            Emit
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4" data-testid="event-metrics-panel">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">Aggregated Metrics</h2>
          <button
            onClick={() => void refreshAll(filterType)}
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
            data-testid="event-refresh-btn"
          >
            Refresh
          </button>
        </div>
        {reports ? (
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <p data-testid="metric-total-views">Views: {reports.totalViews}</p>
            <p data-testid="metric-total-searches">Searches: {reports.totalSearches}</p>
            <p data-testid="metric-total-cart-adds">Cart adds: {reports.totalCartAdds}</p>
            <p data-testid="metric-total-orders">Orders: {reports.totalOrders}</p>
            <p data-testid="metric-total-failures">Failures: {reports.totalFailures}</p>
            <p data-testid="metric-conversion-rate">Conversion: {reports.conversionRate}%</p>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Loading metrics...</p>
        )}
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4" data-testid="event-stream-panel">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="mr-2 text-sm font-medium uppercase tracking-widest text-zinc-500">Event Stream</h2>
          <button
            onClick={() => void applyFilter("")}
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
            data-testid="event-filter-all"
          >
            All
          </button>
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => void applyFilter(type)}
              className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
              data-testid="event-filter-type"
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-2 text-xs text-zinc-500" data-testid="event-type-counts">
          {Object.entries(recentCounts).map(([type, count]) => (
            <span key={type} className="rounded bg-zinc-950 px-2 py-1">
              {type}: {count}
            </span>
          ))}
        </div>

        {loading ? <p className="text-sm text-zinc-400">Loading events...</p> : null}

        <div className="overflow-auto">
          <table className="w-full border-collapse text-left text-sm" data-testid="events-table">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2">Event ID</th>
                <th className="py-2">Type</th>
                <th className="py-2">Timestamp</th>
                <th className="py-2">Product</th>
                <th className="py-2">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.eventId} className="border-b border-zinc-800/50" data-testid="event-row">
                  <td className="py-2">{event.eventId.slice(0, 8)}</td>
                  <td className="py-2">{event.type}</td>
                  <td className="py-2">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="py-2">{event.productId ?? "-"}</td>
                  <td className="py-2 font-mono text-xs text-zinc-400">
                    {JSON.stringify(event.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
