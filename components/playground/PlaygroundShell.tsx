import AuthButton from "@/components/auth/AuthButton";
import type { PlaygroundId } from "@/types";

const LABELS: Record<PlaygroundId, string> = {
  legacy: "Legacy App Lab",
  "api-services": "API Services Lab",
  "event-pipeline": "Event Pipeline Lab",
  "ai-quality": "AI Quality Lab",
  flaky: "Flaky Test Lab",
  accessibility: "Accessibility Lab",
  "release-risk": "Release Risk Lab",
  mobile: "Mobile & Responsive Lab",
  performance: "Performance Lab",
};

interface Props {
  playground: PlaygroundId;
  children: React.ReactNode;
}

export default function PlaygroundShell({ playground, children }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav
        className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between"
        data-testid="playground-nav"
      >
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-sm font-bold text-zinc-400 hover:text-white transition-colors"
          >
            notquality
          </a>
          <span className="text-zinc-700">/</span>
          <span
            className="text-sm font-medium text-white"
            data-testid="playground-label"
          >
            {LABELS[playground]}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span
            className="text-xs text-zinc-500 hidden sm:block"
            data-testid="playground-id"
          >
            {playground}
          </span>
          <AuthButton />
          <span className="text-zinc-800 hidden sm:block">|</span>
          <LogoutButton />
        </div>
      </nav>

      <main className="px-6 py-8 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        data-testid="logout-btn"
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        ← Exit Lab
      </button>
    </form>
  );
}
