"use client";

import { useMemo, useState } from "react";

export default function ReleaseRiskView() {
  const [uiPassRate, setUiPassRate] = useState(92);
  const [apiFailures, setApiFailures] = useState(3);
  const [flakyRate, setFlakyRate] = useState(8);
  const [a11yScore, setA11yScore] = useState(76);
  const [eventErrors, setEventErrors] = useState(5);
  const [aiScore, setAiScore] = useState(61);
  const [criticalBugs, setCriticalBugs] = useState(2);

  const releaseScore = useMemo(() => {
    const weighted =
      uiPassRate * 0.24 +
      (100 - apiFailures * 8) * 0.2 +
      (100 - flakyRate) * 0.14 +
      a11yScore * 0.14 +
      (100 - eventErrors * 10) * 0.12 +
      aiScore * 0.1 +
      (100 - criticalBugs * 12) * 0.06;
    return Math.max(0, Math.min(100, Number(weighted.toFixed(1))));
  }, [uiPassRate, apiFailures, flakyRate, a11yScore, eventErrors, aiScore, criticalBugs]);

  const recommendation =
    releaseScore >= 85 ? "Green" : releaseScore >= 65 ? "Proceed with caution" : "Hold";

  return (
    <div className="space-y-6" data-testid="release-risk-container">
      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4" data-testid="release-input-panel">
        <h2 className="mb-3 text-lg font-semibold">Quality signals</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="UI pass rate %" value={uiPassRate} onChange={setUiPassRate} testId="signal-ui-pass" />
          <Input label="API failures" value={apiFailures} onChange={setApiFailures} testId="signal-api-failures" />
          <Input label="Flaky rate %" value={flakyRate} onChange={setFlakyRate} testId="signal-flaky-rate" />
          <Input label="A11y score" value={a11yScore} onChange={setA11yScore} testId="signal-a11y-score" />
          <Input label="Event errors" value={eventErrors} onChange={setEventErrors} testId="signal-event-errors" />
          <Input label="AI score" value={aiScore} onChange={setAiScore} testId="signal-ai-score" />
          <Input label="Open critical bugs" value={criticalBugs} onChange={setCriticalBugs} testId="signal-critical-bugs" />
        </div>
      </section>

      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4" data-testid="release-score-panel">
        <h2 className="mb-2 text-lg font-semibold">Release confidence</h2>
        <p className="text-3xl font-bold" data-testid="release-confidence-score">
          {releaseScore}%
        </p>
        <p className="mt-2 text-sm text-zinc-300" data-testid="release-recommendation">
          Recommendation: {recommendation}
        </p>
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  testId: string;
}) {
  return (
    <label className="text-sm text-zinc-300">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5"
        data-testid={testId}
      />
    </label>
  );
}
