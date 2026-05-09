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
          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-lg font-semibold" data-testid="score-result">
              Score: {result.score}% ({result.totalScore}/{result.maxScore})
            </p>
            <ul className="space-y-2 text-sm" data-testid="feedback-list">
              {result.feedback.map((item) => (
                <li
                  key={item.bugId}
                  className="rounded border border-zinc-800 px-3 py-2"
                >
                  <div className="font-medium">
                    {item.bugId} - {item.matched ? "Matched" : "Missed"}
                  </div>
                  <div className="text-zinc-400">
                    {item.description} {item.severity ? `(${item.severity})` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
