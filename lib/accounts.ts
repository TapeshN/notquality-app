import accounts from "@/data/seed/accounts.json";
import type { PlaygroundAccount, PlaygroundId } from "@/types";

export const PLAYGROUND_ACCOUNTS: PlaygroundAccount[] = accounts as PlaygroundAccount[];

export function getAccountByEmail(email: string): PlaygroundAccount | undefined {
  return PLAYGROUND_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );
}

export function getRouteForPlayground(playground: PlaygroundId): string {
  const account = PLAYGROUND_ACCOUNTS.find((a) => a.playground === playground);
  return account?.route ?? "/";
}
