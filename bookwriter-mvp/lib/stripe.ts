import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Single source of truth for pricing — do not hardcode prices elsewhere.
// Every checkout route, account/pricing page, and email template should read
// plan names/prices from PLANS (subscriptions) or CREDIT_PACKS (lib/credits.ts,
// one-time credit top-ups — the only other Stripe product PlotGhost sells)
// rather than inlining dollar amounts or plan names as literals. There is no
// other paid path: every generation action is credit-metered, so there's
// nothing left to pay per-item for.
//
// "creator" and "author-pro" were the old plan names/prices before the
// Starter/Author/Studio credit-based repricing — removed since no checkout
// path can select them anymore (app/pricing/page.tsx only ever sends
// starter/author/studio) and PLAN_MONTHLY_CREDITS/PLAN_ROLLOVER_CAP in
// lib/credits.ts already keep 'creator'/'author-pro' as numeric aliases for
// starter/author in case any legacy subscriptionPlan value is still on a
// user record.
export const PLANS = {
  free: {
    name: "Free Starter",
    price: 0,
    monthlyCredits: 1,
    maxProjects: Infinity,
    allowedSizes: ["short"] as string[],
    monthlyRevisions: 1,
    monthlyNewsletters: 2,
    concurrentGenerations: 1,
  },
  studio: {
    name: "Studio",
    price: 9900,
    monthlyCredits: Infinity,
    maxProjects: Infinity,
    allowedSizes: ["short", "medium", "standard"] as string[],
    monthlyRevisions: Infinity,
    monthlyNewsletters: Infinity, // fair use ~100
    concurrentGenerations: 2,
    priority: "highest",
  },
  starter: {
    name: "Starter",
    price: 1900,
    monthlyCredits: 25,
    maxProjects: Infinity,
    allowedSizes: ["short", "medium", "standard", "long", "epic"] as string[],
    monthlyRevisions: Infinity,
    monthlyNewsletters: Infinity,
    concurrentGenerations: 1,
  },
  author: {
    name: "Author",
    price: 4900,
    monthlyCredits: 50,
    maxProjects: Infinity,
    allowedSizes: ["short", "medium", "standard", "long", "epic"] as string[],
    monthlyRevisions: Infinity,
    monthlyNewsletters: Infinity,
    concurrentGenerations: 1,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// Map bookLength string to size key
export function getBookSize(bookLength: string): string {
  if (bookLength.includes("10,000") || bookLength.includes("20,000")) return "short";
  if (bookLength.includes("25,000") || bookLength.includes("40,000")) return "medium";
  if (bookLength.includes("50,000") || bookLength.includes("60,000")) return "standard";
  if (bookLength.includes("75,000")) return "long";
  if (bookLength.includes("100,000") || bookLength.includes("80,000")) return "epic";
  return "short";
}

// Get monthly revision limit for a plan (null = free starter)
export function getRevisionLimit(plan: PlanKey | null): number {
  const effectivePlan = plan || "free";
  if (!PLANS[effectivePlan]) return 0;
  return PLANS[effectivePlan].monthlyRevisions;
}

// Get monthly newsletter limit for a plan (null = free starter)
export function getNewsletterLimit(plan: PlanKey | null): number {
  const effectivePlan = plan || "free";
  if (!PLANS[effectivePlan]) return 0;
  return PLANS[effectivePlan].monthlyNewsletters;
}

// Get concurrent generation limit for a plan (null = free starter)
export function getConcurrentLimit(plan: PlanKey | null): number {
  const effectivePlan = plan || "free";
  if (!PLANS[effectivePlan]) return 1;
  return PLANS[effectivePlan].concurrentGenerations;
}
