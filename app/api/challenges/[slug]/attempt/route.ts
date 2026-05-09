import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scoreAttempt } from "@/lib/scoring";
import { auth } from "@/lib/auth";
import { BUG_REGISTRY } from "@/lib/bugs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  const body = await req.json();
  const { submissions } = body;

  if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
    return NextResponse.json({ error: "submissions required" }, { status: 400 });
  }

  const challenge = await prisma.challenge.findUnique({ where: { slug } });
  if (!challenge || !challenge.active) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const result = scoreAttempt(challenge.bugIds, submissions);

  const attempt = await prisma.challengeAttempt.create({
    data: {
      challengeId: challenge.id,
      userId: session?.user?.id ?? null,
      score: result.percentage,
      completed: true,
      submittedAt: new Date(),
      submissions: {
        create: submissions.map(
          (
            sub: { description: string; steps: string; severity: string },
            i: number
          ) => ({
            description: sub.description,
            steps: sub.steps,
            severity: sub.severity,
            matchedBugId: result.matches[i]?.matched ? result.matches[i].bugId : null,
            score: result.matches[i]?.score ?? 0,
          })
        ),
      },
    },
  });

  // Never expose testHint or actualBehavior in this response
  const allBugs = Object.values(BUG_REGISTRY).flat();

  const feedback = result.matches.map((m) => {
    const bug = allBugs.find((b) => b.id === m.bugId);
    return {
      bugId: m.bugId,
      matched: m.matched,
      score: m.score,
      severity: bug?.severity,
      description: m.matched ? bug?.description : "You missed this one",
      type: m.matched ? bug?.type : null,
    };
  });

  return NextResponse.json({
    attemptId: attempt.id,
    score: result.percentage,
    totalScore: result.totalScore,
    maxScore: result.maxScore,
    feedback,
  });
}
