"use client";

import { getBugsForPlayground } from "@/lib/bugs";

const METRIC_ROWS = [
  { metric: "LCP", target: "≤ 2.5s", test: "Largest Contentful Paint" },
  { metric: "CLS", target: "≤ 0.1", test: "Cumulative Layout Shift" },
  { metric: "TBT", target: "≤ 300ms", test: "Total Blocking Time" },
  { metric: "API p95", target: "≤ 500ms", test: "Endpoint response time" },
];

export default function PerformanceLabView() {
  const bugs = getBugsForPlayground("performance");

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-2 text-lg font-semibold">Purpose</h2>
        <p className="text-sm text-zinc-400">
          This lab concentrates on frontend rendering metrics, slow backend responses, layout
          instability, and leak-prone runtime behavior.
        </p>
      </section>

      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-4 text-lg font-semibold">Known Intentional Issues ({bugs.length})</h2>
        <div className="space-y-3">
          {bugs.map((bug) => (
            <div
              key={bug.id}
              data-testid="bug-entry"
              data-bug-id={bug.id}
              className="rounded-md border border-zinc-800 bg-zinc-950/40 px-4 py-3"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500">{bug.id}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    bug.severity === "high"
                      ? "bg-red-900/50 text-red-400"
                      : bug.severity === "medium"
                        ? "bg-yellow-900/50 text-yellow-400"
                        : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {bug.severity}
                </span>
              </div>
              <p className="text-sm text-white">{bug.description}</p>
              <p className="mt-1 text-xs italic text-zinc-500">{bug.testHint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 text-lg font-semibold">Metrics reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2">Metric</th>
                <th className="py-2">Target</th>
                <th className="py-2">What it tests</th>
              </tr>
            </thead>
            <tbody>
              {METRIC_ROWS.map((row) => (
                <tr key={row.metric} className="border-b border-zinc-800/50 text-zinc-200">
                  <td className="py-2">{row.metric}</td>
                  <td className="py-2">{row.target}</td>
                  <td className="py-2">{row.test}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
