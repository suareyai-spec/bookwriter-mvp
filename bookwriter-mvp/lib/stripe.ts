import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Plan configuration. "creator" and "author-pro" were the old plan names/prices
// before the Starter/Author/Studio credit-based repricing — removed since no
// checkout path can select them anymore (app/pricing/page.tsx only ever sends
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
    creditEquivalents: { short: 1 },
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
    creditEquivalents: { short: 1, medium: 2, standard: 3 },
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
    creditEquivalents: {} as Record<string, number>,
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
    creditEquivalents: {} as Record<string, number>,
    monthlyRevisions: Infinity,
    monthlyNewsletters: Infinity,
    concurrentGenerations: 1,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// Credit prices (one-time purchases) in cents — vary by current plan.
// Superseded by the flat CREDIT_PACKS in lib/credits.ts (used by the
// "credit_pack" checkout type); kept only so the "credit" checkout type
// still resolves sane prices for the plan a user is actually on.
export const CREDIT_PRICES: Record<string, Record<string, number>> = {
  free: { short: 12900, medium: 17900, standard: 24900, epic: 49900 },
  starter: { short: 12900, medium: 17900, standard: 24900, epic: 49900 },
  author: { short: 9900, medium: 14900, standard: 19900, epic: 49900 },
  studio: { short: 7900, medium: 12900, standard: 17900, epic: 49900 },
  none: { short: 12900, medium: 17900, standard: 24900, epic: 49900 },
};

// Additional newsletter prices in cents (unused now that newsletters are
// unlimited on every paid plan — kept for backward compatibility).
export const NEWSLETTER_PRICES: Record<string, number> = {
  free: 500,
  starter: 0,
  author: 0,
  studio: 0,
  none: 500,
};

// Revision prices — Starter, Author, and Studio all include unlimited
// revisions, so no per-revision purchase is needed on any paid plan.
export const REVISION_PRICES: Record<string, { single: number; pack: { count: number; price: number }; unlimited: number }> = {
  free: { single: 500, pack: { count: 10, price: 3900 }, unlimited: 9900 },
  starter: { single: 0, pack: { count: 0, price: 0 }, unlimited: 0 },
  author: { single: 0, pack: { count: 0, price: 0 }, unlimited: 0 },
  studio: { single: 0, pack: { count: 0, price: 0 }, unlimited: 0 },
  none: { single: 500, pack: { count: 10, price: 3900 }, unlimited: 9900 },
};

// Map bookLength string to size key
export function getBookSize(bookLength: string): string {
  if (bookLength.includes("10,000") || bookLength.includes("20,000")) return "short";
  if (bookLength.includes("25,000") || bookLength.includes("40,000")) return "medium";
  if (bookLength.includes("50,000") || bookLength.includes("60,000")) return "standard";
  if (bookLength.includes("75,000")) return "long";
  if (bookLength.includes("100,000") || bookLength.includes("80,000")) return "epic";
  return "short";
}

// Get credit cost in monthly points for a book size
export function getBookCreditCost(plan: PlanKey, size: string): number {
  const equiv = PLANS[plan].creditEquivalents as Record<string, number>;
  return equiv[size] || Infinity;
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
