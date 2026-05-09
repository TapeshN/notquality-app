import { prisma } from "@/lib/db";
import Link from "next/link";
import { SignInButton } from "@/components/auth/SignInButton";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  const challenges = await prisma.challenge.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2" data-testid="challenges-heading">
        Challenges
      </h1>
      <p className="text-zinc-400 mb-6">
        Practice real-world QA skills against a live, intentionally broken
        system.
      </p>
      <div className="mb-10">
        <SignInButton />
      </div>
      <div className="space-y-4" data-testid="challenge-list">
        {challenges.map((challenge) => (
          <Link
            key={challenge.id}
            href={`/challenges/${challenge.slug}`}
            data-testid="challenge-card"
            className="block rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-base font-semibold">{challenge.title}</span>
              <span className="text-xs text-zinc-500 capitalize">
                {challenge.difficulty}
              </span>
            </div>
            <p className="text-sm text-zinc-400">{challenge.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
