"use client";

import { useEffect, useState } from "react";

interface ReportPayload {
  totalViews: number;
  totalSearches: number;
  totalCartAdds: number;
  totalOrders: number;
  totalFailures: number;
  conversionRate: number;
}

export default function DashboardView() {
  const [report, setReport] = useState<ReportPayload | null>(null);

  useEffect(() => {
    async function loadReport() {
      const response = await fetch("/api/reports", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as ReportPayload;
      setReport(data);
    }
    void loadReport();
  }, []);

  const metricClass = "rounded-md border border-zinc-800 bg-zinc-950/40 p-4";

  return (
    <section data-testid="dashboard-container">
      <h1 className="mb-4 text-2xl font-bold">Legacy Dashboard</h1>
      {!report ? <p className="text-zinc-400">Loading dashboard...</p> : null}
      {report ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className={metricClass} data-testid="metric-views">
            <p className="text-sm text-zinc-400">Products viewed</p>
            <p className="text-xl font-semibold">{report.totalViews}</p>
          </div>
          <div className={metricClass} data-testid="metric-searches">
            <p className="text-sm text-zinc-400">Searches</p>
            <p className="text-xl font-semibold">{report.totalSearches}</p>
          </div>
          <div className={metricClass} data-testid="metric-cart-adds">
            <p className="text-sm text-zinc-400">Cart adds</p>
            <p className="text-xl font-semibold">{report.totalCartAdds}</p>
          </div>
          <div className={metricClass} data-testid="metric-orders">
            <p className="text-sm text-zinc-400">Orders</p>
            <p className="text-xl font-semibold">{report.totalOrders}</p>
          </div>
          <div className={metricClass} data-testid="metric-failures">
            <p className="text-sm text-zinc-400">Failures</p>
            <p className="text-xl font-semibold">{report.totalFailures}</p>
          </div>
          <div className={metricClass} data-testid="metric-conversion">
            <p className="text-sm text-zinc-400">Conversion rate</p>
            <p className="text-xl font-semibold">{report.conversionRate.toFixed(1)}%</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
