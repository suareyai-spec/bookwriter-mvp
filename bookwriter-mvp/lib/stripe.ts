import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Plan configuration
export const PLANS = {
  starter: {
    name: "Starter",
    price: 2900, // cents
    monthlyCredits: 1, // 1 short book equivalent
    maxProjects: 2,
    allowedSizes: ["short"] as string[],
    creditEquivalents: { short: 1 }, // 1 short = 1 credit
  },
  author: {
    name: "Author",
    price: 7900,
    monthlyCredits: 6, // 2 medium (3 each) OR 3 short (2 each) — using points system
    maxProjects: 5,
    allowedSizes: ["short", "medium"] as string[],
    creditEquivalents: { short: 2, medium: 3 }, // 6 points: 3 short OR 2 medium OR mix
  },
  pro: {
    name: "Pro Author",
    price: 14900,
    monthlyCredits: 12, // 2 standard (6 each) OR 4 medium (3 each) OR 6 short (2 each)
    maxProjects: Infinity,
    allowedSizes: ["short", "medium", "standard"] as string[],
    creditEquivalents: { short: 2, medium: 3, standard: 6 },
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// Credit prices (one-time purchases) in cents — vary by current plan
export const CREDIT_PRICES: Record<string, Record<string, number>> = {
  starter: { short: 3900, medium: 7900, standard: 14900, epic: 24900 },
  author: { short: 2900, medium: 5900, standard: 9900, epic: 19900 },
  pro: { short: 2900, medium: 5900, standard: 7900, epic: 14900 },
  none: { short: 3900, medium: 7900, standard: 14900, epic: 24900 },
};

// Map bookLength string to size key
export function getBookSize(bookLength: string): string {
  if (bookLength.includes("10,000")) return "short";
  if (bookLength.includes("25,000")) return "medium";
  if (bookLength.includes("50,000")) return "standard";
  if (bookLength.includes("75,000")) return "standard"; // Long = Standard pricing
  if (bookLength.includes("100,000")) return "epic";
  return "short";
}

// Get credit cost in monthly points for a book size
export function getBookCreditCost(plan: PlanKey, size: string): number {
  const equiv = PLANS[plan].creditEquivalents as Record<string, number>;
  return equiv[size] || Infinity;
}
