"use client";

import { getBugsForPlayground } from "@/lib/bugs";

// BUG MOB-001: Touch targets on product cards are smaller than 44x44px
// BUG MOB-002: Order history table causes horizontal scroll on mobile
// BUG MOB-003: Sticky nav covers form input when mobile keyboard opens
// BUG MOB-004: Product images overflow their container at 320px
// BUG MOB-005: Modal cannot be dismissed on small screens — close button scrolls out of view
// BUG MOB-006: Font size below 16px on input fields triggers iOS zoom
// BUG MOB-007: Cart quantity stepper buttons too close together for touch
// BUG MOB-008: Hero section text overflows on 320px viewport

export default function MobileLabView() {
  const bugs = getBugsForPlayground("mobile");

  return (
    <div className="space-y-6" data-testid="playground-shell">
      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-2 text-lg font-semibold">Purpose</h2>
        <p className="text-sm text-zinc-400">
          This lab focuses on mobile viewport bugs, touch target sizing, keyboard overlays, and
          responsive breakpoints.
        </p>
      </section>

      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-4 text-lg font-semibold">Known Intentional Issues ({bugs.length})</h2>
        <div className="space-y-3">
          {bugs.map((bug) => (
            <div
              key={bug.id}
              data-testid="bug-entry"
              data-bug-id={bug.id}
              className="rounded-md border border-zinc-800 bg-zinc-950/40 px-4 py-3"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500">{bug.id}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    bug.severity === "high"
                      ? "bg-red-900/50 text-red-400"
                      : bug.severity === "medium"
                        ? "bg-yellow-900/50 text-yellow-400"
                        : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {bug.severity}
                </span>
              </div>
              <p className="text-sm text-white">{bug.description}</p>
              <p className="mt-1 text-xs italic text-zinc-500">{bug.testHint}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
