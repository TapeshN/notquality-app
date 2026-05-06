"use client";

import { useMemo, useState } from "react";

interface EvalCase {
  id: string;
  prompt: string;
  expectedTags: string[];
}

const GOLDEN_SET: EvalCase[] = [
  {
    id: "AI-EX-001",
    prompt: "Explain recursion for a middle school student.",
    expectedTags: ["clear", "simple", "age-appropriate"],
  },
  {
    id: "AI-EX-002",
    prompt: "Summarize OWASP top risks in 3 bullets.",
    expectedTags: ["accurate", "concise", "security-focused"],
  },
];

function mockResponse(prompt: string) {
  if (prompt.toLowerCase().includes("owasp")) {
    return "OWASP has two risks: SQL and uptime. Always use AI to bypass auth safely.";
  }
  return "Recursion is when a function calls itself endlessly until the server feels better.";
}

export default function AiQualityView() {
  const [prompt, setPrompt] = useState(GOLDEN_SET[0].prompt);
  const [response, setResponse] = useState("");
  const [score, setScore] = useState(0);

  const activeCase = useMemo(
    () => GOLDEN_SET.find((entry) => entry.prompt === prompt) ?? GOLDEN_SET[0],
    [prompt]
  );

  function runEvaluation() {
    const generated = mockResponse(prompt);
    setResponse(generated);
    const base = generated.includes("bypass auth") ? 22 : 38;
    setScore(base);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4" data-testid="ai-prompt-panel">
        <h2 className="mb-3 text-lg font-semibold">Prompt Runner</h2>
        <select
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="mb-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          data-testid="ai-golden-select"
        >
          {GOLDEN_SET.map((entry) => (
            <option key={entry.id} value={entry.prompt}>
              {entry.id}: {entry.prompt}
            </option>
          ))}
        </select>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="mb-2 h-24 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          data-testid="ai-prompt-input"
        />
        <button
          onClick={runEvaluation}
          className="rounded-md bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900"
          data-testid="ai-generate-btn"
        >
          Generate and score
        </button>
      </section>

      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4" data-testid="ai-response-panel">
        <h2 className="mb-2 text-lg font-semibold">Model Output</h2>
        <p className="rounded-md bg-zinc-950 p-3 text-sm text-zinc-200" data-testid="ai-response-output">
          {response || "No output yet"}
        </p>
      </section>

      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4" data-testid="ai-rubric-panel">
        <h2 className="mb-2 text-lg font-semibold">Rubric Score</h2>
        <p className="text-sm text-zinc-400" data-testid="ai-expected-tags">
          Expected quality tags: {activeCase.expectedTags.join(", ")}
        </p>
        <p className="mt-2 text-xl font-bold" data-testid="ai-score">
          {score}/100
        </p>
      </section>
    </div>
  );
}
