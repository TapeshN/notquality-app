import homepageBugs from "@/data/bugs/homepage-bugs.json";
import legacyBugs from "@/data/bugs/legacy-bugs.json";
import apiBugs from "@/data/bugs/api-bugs.json";
import eventBugs from "@/data/bugs/event-bugs.json";
import mobileBugs from "@/data/bugs/mobile-bugs.json";
import performanceBugs from "@/data/bugs/performance-bugs.json";
import type { Bug } from "@/types";

export const BUG_REGISTRY: Record<string, Bug[]> = {
  homepage: homepageBugs as Bug[],
  legacy: legacyBugs as Bug[],
  "api-services": apiBugs as Bug[],
  "event-pipeline": eventBugs as Bug[],
  mobile: mobileBugs as Bug[],
  performance: performanceBugs as Bug[],
};

export function getBugsForPlayground(playground: string): Bug[] {
  return BUG_REGISTRY[playground] ?? [];
}

export function getRandomHomepageBugId(): string {
  const bugs = BUG_REGISTRY.homepage;
  const index = Math.floor(Math.random() * bugs.length);
  return bugs[index].id;
}

export function getAllBugs(): Bug[] {
  return Object.values(BUG_REGISTRY).flat();
}
