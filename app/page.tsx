import Link from "next/link";
import { PLAYGROUND_ACCOUNTS } from "@/lib/accounts";
import { getRandomHomepageBugId } from "@/lib/bugs";
import AuthButton from "@/components/auth/AuthButton";
import CredentialCard from "@/components/landing/CredentialCard";
import HomepageBugOverlay from "@/components/landing/HomepageBugOverlay";

export default function HomePage() {
  const activeBugId = getRandomHomepageBugId();
  // BUG HP-005: cards can render in a different first-load order in the homepage grid.

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <HomepageBugOverlay bugId={activeBugId} />
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
        <span className="text-sm font-semibold text-zinc-400 tracking-tight">
          notquality<span className="text-zinc-600">.com</span>
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/challenges"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
            data-testid="nav-challenges"
          >
            Challenges
          </Link>
          <AuthButton />
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-12 text-center max-w-3xl mx-auto">
        <h1
          className="text-4xl font-bold tracking-tight mb-3"
          data-testid="hero-title"
        >
          notquality<span className="text-zinc-400">.com</span>
        </h1>
        <p
          className="text-zinc-400 text-lg leading-relaxed mb-8"
          data-testid="hero-subtitle"
        >
          A deliberately imperfect application for testing things that usually break.
          Practice testing legacy apps, APIs, event pipelines, AI workflows,
          accessibility issues, flaky tests, and release risk decisions.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="/login"
            data-testid="cta-launch"
            className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            Launch Playground
          </a>
          <a
            href="https://github.com/TapeshN"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="cta-github"
            className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
          >
            View Frameworks on GitHub
          </a>
        </div>
      </section>

      {/* Playground cards */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-6 text-center">
          Select a playground to get started
        </h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="credential-grid"
        >
          {PLAYGROUND_ACCOUNTS.map((account, index) => (
            <CredentialCard
              key={account.playground}
              account={account}
              index={index}
              activeBugId={activeBugId}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-6 text-center text-xs text-zinc-600">
        notquality.com — built by{" "}
        <a
          href="https://github.com/TapeshN"
          className="hover:text-zinc-400 transition-colors"
        >
          Tapesh Nagarwal
        </a>
        . A QA portfolio platform.
      </footer>
    </main>
  );
}
