"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function SignInButton() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <span>
          Signed in as{" "}
          <span className="font-medium text-white">
            {session.user.username ?? session.user.name}
          </span>
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-zinc-500 hover:text-zinc-300 underline"
          data-testid="sign-out-btn"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("github")}
      className="inline-flex items-center gap-2 rounded-md bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      data-testid="sign-in-github"
    >
      Sign in with GitHub
    </button>
  );
}
