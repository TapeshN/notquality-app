import { BUG_REGISTRY } from "@/lib/bugs";

interface Submission {
  description: string;
  steps: string;
  severity: string;
}

const SEVERITY_WEIGHT: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function scoreAttempt(
  bugIds: string[],
  submissions: Submission[]
): {
  totalScore: number;
  maxScore: number;
  percentage: number;
  matches: { bugId: string; matched: boolean; score: number }[];
} {
  const allBugs = Object.values(BUG_REGISTRY).flat();
  const targetBugs = allBugs.filter((b) => bugIds.includes(b.id));

  const maxScore = targetBugs.reduce(
    (sum, bug) => sum + (SEVERITY_WEIGHT[bug.severity] ?? 1),
    0
  );

  const matches = targetBugs.map((bug) => {
    const keywords = [
      ...bug.description.toLowerCase().split(" "),
      bug.type,
      bug.id.toLowerCase(),
    ];

    const matched = submissions.some((sub) => {
      const text = `${sub.description} ${sub.steps}`.toLowerCase();
      const keywordHits = keywords.filter(
        (kw) => kw.length > 4 && text.includes(kw)
      );
      return keywordHits.length >= 2;
    });

    const score = matched ? (SEVERITY_WEIGHT[bug.severity] ?? 1) : 0;
    return { bugId: bug.id, matched, score };
  });

  const totalScore = matches.reduce((sum, m) => sum + m.score, 0);
  const percentage =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return { totalScore, maxScore, percentage, matches };
}
