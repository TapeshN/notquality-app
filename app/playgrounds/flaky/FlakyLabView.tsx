"use client";

import { useState } from "react";

export default function FlakyLabView() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [raceValue, setRaceValue] = useState("idle");

  async function runFlakyRequest() {
    setLoading(true);
    setResult("");

    const delayMs = Math.floor(100 + Math.random() * 2900);
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const fails = Math.random() < 0.3;
    setLoading(false);
    setResult(fails ? `500 error after ${delayMs}ms` : `200 success after ${delayMs}ms`);
  }

  async function triggerRaceCondition() {
    setRaceValue("loading");
    const first = new Promise<string>((resolve) => setTimeout(() => resolve("newer"), 700));
    const second = new Promise<string>((resolve) => setTimeout(() => resolve("older"), 1200));

    const firstResult = await first;
    setRaceValue(firstResult);

    const secondResult = await second;
    setRaceValue(secondResult);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4" data-testid="flaky-delay-panel">
        <h2 className="mb-2 text-lg font-semibold">Random delay and intermittent failures</h2>
        <button
          onClick={() => void runFlakyRequest()}
          className="rounded-md bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900"
          data-testid="flaky-request-btn"
        >
          {loading ? "Running..." : "Run request"}
        </button>
        <p className="mt-3 text-sm text-zinc-300" data-testid="flaky-request-result">
          {result || "No request executed"}
        </p>
      </section>

      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4" data-testid="flaky-race-panel">
        <h2 className="mb-2 text-lg font-semibold">Race condition demo</h2>
        <button
          onClick={() => void triggerRaceCondition()}
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
          data-testid="flaky-race-btn"
        >
          Trigger race
        </button>
        <p className="mt-3 text-sm text-zinc-300" data-testid="flaky-race-value">
          UI state: {raceValue}
        </p>
      </section>
    </div>
  );
}
