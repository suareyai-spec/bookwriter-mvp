import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Re-export plan types for backward compatibility
import { PLANS as CONFIG_PLANS, type PlanId, MONTHLY_POINTS, getBookPoints, canGenerateBookSize, BOOK_SIZES } from "@/lib/config";

// Plan configuration (backward compat wrapper)
export const PLANS = {
  free: {
    name: "Free Starter",
    price: 0,
    monthlyCredits: MONTHLY_POINTS.free,
    maxProjects: Infinity,
    allowedSizes: ["short"] as string[],
    creditEquivalents: { short: 1 },
    monthlyRevisions: 1,
    monthlyNewsletters: 2,
    concurrentGenerations: 1,
  },
  creator: {
    name: "Creator",
    price: 9900, // cents
    monthlyCredits: MONTHLY_POINTS.creator,
    maxProjects: Infinity,
    allowedSizes: ["short", "medium"] as string[],
    creditEquivalents: { short: 1, medium: 2 },
    monthlyRevisions: 30,
    monthlyNewsletters: 10,
    concurrentGenerations: 1,
  },
  "author-pro": {
    name: "Author Pro",
    price: 19900,
    monthlyCredits: MONTHLY_POINTS["author-pro"],
    maxProjects: Infinity,
    allowedSizes: ["short", "medium", "standard"] as string[],
    creditEquivalents: { short: 1, medium: 2, standard: 3 },
    monthlyRevisions: Infinity,
    monthlyNewsletters: 30,
    concurrentGenerations: 1,
    priority: true,
  },
  studio: {
    name: "Studio",
    price: 34900,
    monthlyCredits: MONTHLY_POINTS.studio,
    maxProjects: Infinity,
    allowedSizes: ["short", "medium", "standard"] as string[],
    creditEquivalents: { short: 1, medium: 2, standard: 3 },
    monthlyRevisions: Infinity,
    monthlyNewsletters: Infinity, // fair use ~100
    concurrentGenerations: 2,
    priority: "highest",
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// Credit prices (one-time purchases) in cents — vary by current plan
export const CREDIT_PRICES: Record<string, Record<string, number>> = {
  free: { short: 12900, medium: 17900, standard: 24900, epic: 49900 },
  creator: { short: 12900, medium: 17900, standard: 24900, epic: 49900 },
  "author-pro": { short: 9900, medium: 14900, standard: 19900, epic: 49900 },
  studio: { short: 7900, medium: 12900, standard: 17900, epic: 49900 },
  none: { short: 12900, medium: 17900, standard: 24900, epic: 49900 },
};

// Additional newsletter prices in cents
export const NEWSLETTER_PRICES: Record<string, number> = {
  free: 500,
  creator: 500,
  "author-pro": 400,
  studio: 0,
  none: 500,
};

// Revision prices — only Creator has a cap (30/mo), others unlimited
// No more per-revision purchasing needed for author-pro/studio
export const REVISION_PRICES: Record<string, { single: number; pack: { count: number; price: number }; unlimited: number }> = {
  free: { single: 500, pack: { count: 10, price: 3900 }, unlimited: 9900 },
  creator: { single: 500, pack: { count: 10, price: 3900 }, unlimited: 9900 },
  "author-pro": { single: 0, pack: { count: 0, price: 0 }, unlimited: 0 },
  studio: { single: 0, pack: { count: 0, price: 0 }, unlimited: 0 },
  none: { single: 500, pack: { count: 10, price: 3900 }, unlimited: 9900 },
};

// Map bookLength string to size key
export function getBookSize(bookLength: string): string {
  if (bookLength.includes("10,000") || bookLength.includes("20,000")) return "short";
  if (bookLength.includes("25,000") || bookLength.includes("40,000")) return "medium";
  if (bookLength.includes("50,000") || bookLength.includes("60,000")) return "standard";
  if (bookLength.includes("75,000")) return "standard";
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
