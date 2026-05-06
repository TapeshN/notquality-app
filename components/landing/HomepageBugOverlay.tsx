"use client";

// Injects the active homepage bug ID into a hidden element so test frameworks
// can assert which bug is active in the current session.
export default function HomepageBugOverlay({ bugId }: { bugId: string }) {
  return (
    <span
      data-testid="active-homepage-bug"
      data-bug-id={bugId}
      className="sr-only"
      aria-hidden="true"
    />
  );
}
