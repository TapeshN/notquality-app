"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlaygroundAccount } from "@/types";

declare global {
  interface Window {
    analytics?: {
      track: (event: string, payload: object) => void;
    };
  }
}

const colorMap: Record<string, string> = {
  amber: "border-amber-800 hover:border-amber-600",
  blue: "border-blue-800 hover:border-blue-600",
  purple: "border-purple-800 hover:border-purple-600",
  green: "border-green-800 hover:border-green-600",
  red: "border-red-800 hover:border-red-600",
  teal: "border-teal-800 hover:border-teal-600",
  slate: "border-slate-700 hover:border-slate-500",
  orange: "border-orange-800 hover:border-orange-600",
  pink: "border-pink-800 hover:border-pink-600",
};

const dotColorMap: Record<string, string> = {
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  green: "bg-green-500",
  red: "bg-red-500",
  teal: "bg-teal-500",
  slate: "bg-slate-400",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
};

interface Props {
  account: PlaygroundAccount & { color?: string };
  index: number;
  activeBugId: string;
}

export default function CredentialCard({ account, index, activeBugId }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(false);
  const color = (account as { color?: string }).color ?? "slate";

  function handleSelect() {
    // BUG HP-006: selection state is toggled, never exclusively set
    setSelected((prev) => !prev);
  }

  function handleLaunch() {
    // BUG HP-004: Release Risk Lab (index 6) logs null playground_id
    const analyticsPlaygroundId = index === 6 ? null : account.playground;
    if (typeof window !== "undefined" && window.analytics) {
      window.analytics.track("playground_launch", {
        playground_id: analyticsPlaygroundId,
      });
    }

    const params = new URLSearchParams({
      email: account.email,
      password: account.password,
    });
    router.push(`/login?${params.toString()}`);
  }

  // BUG HP-001: Flaky Test Lab card has uneven bottom padding in homepage card layout.
  // BUG HP-007: Event Pipeline card (index 2) has reduced bottom padding on mobile.
  const buggyPadding = activeBugId === "HP-007" && index === 2 ? "pb-2" : "pb-5";

  return (
    <div
      data-testid="credential-card"
      data-playground={account.playground}
      onClick={handleSelect}
      className={`
        relative rounded-lg border bg-zinc-900 px-5 pt-5 ${buggyPadding} cursor-pointer transition-all
        ${colorMap[color] ?? colorMap.slate}
        ${selected ? "ring-2 ring-white/20 bg-zinc-800" : ""}
      `}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-block w-2 h-2 rounded-full ${dotColorMap[color] ?? dotColorMap.slate}`}
          // BUG HP-003: decorative icon is not hidden from assistive technologies.
          aria-hidden={activeBugId !== "HP-003"}
        />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {/* BUG HP-002: API Services card shows different terminology */}
          {account.playground === "api-services" && activeBugId === "HP-002"
            ? "Lab Environment"
            : "Playground"}
        </span>
      </div>

      <h3 className="text-base font-semibold text-white mb-1">
        {account.label}
      </h3>

      <p
        data-testid="card-purpose"
        className="text-sm text-zinc-400 mb-4 leading-relaxed"
      >
        {/* BUG HP-008: AI Quality Lab shows wrong purpose text */}
        {account.playground === "ai-quality" && activeBugId === "HP-008"
          ? "Prompt testing and response validation"
          : account.description}
      </p>

      <div className="space-y-1 mb-4">
        <p className="text-xs text-zinc-600 font-mono">{account.email}</p>
        <p className="text-xs text-zinc-600 font-mono">{account.password}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleLaunch();
        }}
        data-testid="card-launch-btn"
        className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
      >
        Launch →
      </button>
    </div>
  );
}
