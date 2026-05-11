"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Severity = "low" | "medium" | "high";

interface ChallengeData {
  id: string;
  slug: string;
  title: string;
  description: string;
  playground: string;
  difficulty: string;
}

interface BugSubmissionInput {
  description: string;
  steps: string;
  severity: Severity;
}

interface AttemptResult {
  attemptId: string;
  score: number;
  totalScore: number;
  maxScore: number;
  feedback: {
    bugId: string;
    matched: boolean;
    score: number;
    severity?: string;
    description?: string;
    type?: string | null;
  }[];
}

const EMPTY_SUBMISSION: BugSubmissionInput = {
  description: "",
  steps: "",
  severity: "medium",
};

function BugReportGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-400 hover:text-white transition-colors"
        data-testid="bug-guide-toggle"
      >
        <span>📋 How to write a good bug report</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 text-sm text-zinc-400 border-t border-zinc-800 pt-3">
          <div>
            <p className="text-zinc-300 font-medium mb-1">Description</p>
            <p>Be specific. Include the component name and what is wrong.</p>
            <p className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded mt-1">
              Example: "Add to Cart button on product listing has no aria-label"
            </p>
          </div>
          <div>
            <p className="text-zinc-300 font-medium mb-1">Steps to reproduce</p>
            <p>Number your steps. Start from a clean state.</p>
            <p className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded mt-1">
              Example: "1. Go to /playgrounds/legacy/products 2. Observe the Add buttons 3. Inspect with screen reader"
            </p>
          </div>
          <div>
            <p className="text-zinc-300 font-medium mb-1">Severity</p>
            <ul className="space-y-1 text-xs">
              <li><span className="text-red-400 font-medium">High</span> — blocks a user flow or causes data loss</li>
              <li><span className="text-yellow-400 font-medium">Medium</span> — degrades experience, workaround exists</li>
              <li><span className="text-zinc-400 font-medium">Low</span> — cosmetic or minor UX issue</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string>("");
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [submissions, setSubmissions] = useState<BugSubmissionInput[]>([
    { ...EMPTY_SUBMISSION },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadChallenge() {
      setIsLoading(true);
      setError(null);
      try {
        const resolved = await params;
        if (!mounted) return;
        setSlug(resolved.slug);

        const response = await fetch(`/api/challenges/${resolved.slug}`);
        if (!response.ok) {
          throw new Error("Challenge not found");
        }
        const data = (await response.json()) as ChallengeData;
        if (!mounted) return;
        setChallenge(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load challenge");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadChallenge();
    return () => {
      mounted = false;
    };
  }, [params]);

  function updateSubmission<K extends keyof BugSubmissionInput>(
    index: number,
    key: K,
    value: BugSubmissionInput[K]
  ) {
    setSubmissions((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry))
    );
  }

  function addSubmission() {
    setSubmissions((prev) => [...prev, { ...EMPTY_SUBMISSION }]);
  }

  async function submitAttempt() {
    if (!slug) return;
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        submissions: submissions.filter(
          (s) => s.description.trim() && s.steps.trim()
        ),
      };

      if (payload.submissions.length === 0) {
        throw new Error("Please add at least one complete bug report.");
      }

      const response = await fetch(`/api/challenges/${slug}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AttemptResult | { error: string };
      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "Failed to submit challenge attempt"
        );
      }

      setResult(data as AttemptResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <main className="px-6 py-12 text-white">Loading challenge...</main>;
  }

  if (!challenge) {
    return (
      <main className="px-6 py-12 text-white">
        <p>{error ?? "Challenge not found."}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-12 max-w-4xl mx-auto space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold" data-testid="challenge-title">
          {challenge.title}
        </h1>
        <p className="text-zinc-300" data-testid="challenge-description">
          {challenge.description}
        </p>
        <div className="text-sm text-zinc-400">
          Difficulty: <span className="capitalize">{challenge.difficulty}</span>
        </div>
        <Link
          href={`/playgrounds/${challenge.playground}`}
          target="_blank"
          className="inline-block text-sm underline text-blue-400"
        >
          Open playground in new tab
        </Link>
      </section>

      <section className="space-y-4">
        <BugReportGuide />

        {submissions.map((submission, index) => (
          <div
            key={`submission-${index}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3"
          >
            <textarea
              data-testid="bug-description-input"
              className="w-full rounded bg-zinc-800 px-3 py-2 text-sm"
              placeholder="Bug description"
              value={submission.description}
              onChange={(e) =>
                updateSubmission(index, "description", e.target.value)
              }
            />
            <textarea
              data-testid="bug-steps-input"
              className="w-full rounded bg-zinc-800 px-3 py-2 text-sm"
              placeholder="Steps to reproduce"
              value={submission.steps}
              onChange={(e) => updateSubmission(index, "steps", e.target.value)}
            />
            <select
              data-testid="bug-severity-select"
              className="rounded bg-zinc-800 px-3 py-2 text-sm"
              value={submission.severity}
              onChange={(e) =>
                updateSubmission(index, "severity", e.target.value as Severity)
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        ))}

        <button
          type="button"
          data-testid="add-bug-btn"
          className="rounded bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
          onClick={addSubmission}
        >
          Add another bug report
        </button>

        <button
          type="button"
          data-testid="submit-attempt-btn"
          className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:opacity-50"
          onClick={() => void submitAttempt()}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit attempt"}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {result && (
          <div
            className="space-y-5 rounded-lg border border-zinc-800 bg-zinc-900 p-5"
            data-testid="score-result"
          >
            {/* Overall score */}
            <div>
              <p className="text-2xl font-bold">
                {result.score}%
                <span className="text-sm font-normal text-zinc-400 ml-2">
                  ({result.totalScore} / {result.maxScore} points)
                </span>
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            {/* Severity breakdown */}
            <div className="space-y-2">
              {(["high", "medium", "low"] as const).map((sev) => {
                const sevBugs = result.feedback.filter((f) => f.severity === sev);
                if (sevBugs.length === 0) return null;
                const found = sevBugs.filter((f) => f.matched).length;
                const total = sevBugs.length;
                const pct = Math.round((found / total) * 100);
                const colors = {
                  high: "bg-red-500",
                  medium: "bg-yellow-500",
                  low: "bg-zinc-500",
                };
                return (
                  <div key={sev} data-testid={`severity-row-${sev}`}>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span className="capitalize">{sev} severity</span>
                      <span>{found} / {total}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-800">
                      <div
                        className={`h-1.5 rounded-full ${colors[sev]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Per-bug feedback */}
            <ul className="space-y-2 text-sm" data-testid="feedback-list">
              {result.feedback.map((item) => (
                <li
                  key={item.bugId}
                  className={`rounded border px-3 py-2 ${
                    item.matched
                      ? "border-zinc-700 bg-zinc-800"
                      : "border-red-900/50 bg-red-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-500">{item.bugId}</span>
                    <div className="flex items-center gap-2">
                      {item.severity && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          item.severity === "high"
                            ? "bg-red-900/50 text-red-400"
                            : item.severity === "medium"
                            ? "bg-yellow-900/50 text-yellow-400"
                            : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {item.severity}
                        </span>
                      )}
                      <span className={`text-xs font-medium ${item.matched ? "text-green-400" : "text-red-400"}`}>
                        {item.matched ? "Found" : "Missed"}
                      </span>
                    </div>
                  </div>
                  <p className="text-zinc-300 mt-1">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
