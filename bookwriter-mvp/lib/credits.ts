import { prisma } from "@/lib/prisma";

// Single source of truth for what every generation action costs. Everything
// in PlotGhost is credit-metered — there is no other paid path except the
// monthly subscription (which grants a credit allowance) and credit packs
// (which top up the balance). Costs are calibrated to generation complexity
// and output length, not an arbitrary flat rate.
export const CREDIT_COST: Record<string, number> = {
  // ──── ARTICLES & SHORT CONTENT ────
  // Single-call, short, bounded-length generations — the cheapest tier.
  newsletter: 1,
  article: 1,
  whitepaper_short: 3,        // 6-8 pages
  whitepaper_standard: 5,     // 10-15 pages
  whitepaper_comprehensive: 8, // 16-25 pages

  // ──── BOOKS ────
  // Priced by target word count, since word count is the actual cost driver
  // (each chapter is its own model call — more/longer chapters cost more).
  short: 5,     // ~10,000 words
  medium: 10,   // ~30,000 words
  standard: 18, // ~60,000 words
  long: 22,     // ~75,000 words — interpolated between standard and epic
  epic: 30,     // ~100,000 words

  // ──── COURSES ────
  // Influencer Course Builder tiers scale with lesson count; University
  // Course is priced separately below (it's a different, much larger product).
  course_mini: 8,     // 5-7 lessons
  course_full: 16,    // 10-20 lessons
  course_premium: 20, // 10-20 lessons + workbook
  // A 12-15 week university course generates roughly 20-30 model calls
  // (syllabus + weekly outlines + 12-15 weekly lectures + assessment package)
  // and comparable-or-greater total word volume to an Epic book (30 credits),
  // plus structurally distinct content (quizzes with answer keys, rubrics,
  // midterm/final) an Epic book doesn't have — priced above Epic to reflect that.
  university_course: 45,

  // ──── RESEARCH & ACADEMIC ────
  // Flat regardless of the Standard vs. Advanced Research Project tier —
  // both are the same 7-section outline-then-section pipeline.
  thesis: 4,

  // ──── COMIC & THEATER ────
  // De-promoted (not in the main nav) but still functional — priced the same
  // complexity-based way as everything else. "Full"/"Long" tiers generate
  // ~2.5x the content of the standard tier (5 issues/acts vs. 1-2).
  comic_single: 8,
  comic_full: 20,
  play_standard: 8,
  play_long: 20,

  // ──── TRANSLATION ────
  // translation_short / translation_standard are flat-rate lookups (see
  // below); full-book translation is computed dynamically by
  // getTranslationCreditCost() since it has to scale with the specific
  // book's word count, not a fixed tier.
  translation_short: 3,    // up to 10k words
  translation_standard: 8, // 10k-40k words

  // ──── REVISIONS ────
  // Per-chapter charges 1 credit for each chapter actually touched, capped
  // at the full-book flat rate — see getRevisionCreditCost() below.
  revision_chapter: 1,
  revision_full: 3,
};

/**
 * Full-book translation scales with the source's word count rather than a
 * fixed tier — proportional to length, floored and capped so it never
 * undercharges a huge book or overcharges past what an Epic book itself costs.
 */
export function getTranslationCreditCost(wordCount: number): number {
  if (wordCount <= 10000) return CREDIT_COST.translation_short;
  if (wordCount <= 40000) return CREDIT_COST.translation_standard;
  return Math.min(25, Math.max(5, Math.round(wordCount / 4000)));
}

/**
 * Revision cost: 1 credit per chapter actually touched, capped at the flat
 * full-book rate — so revising most-but-not-all chapters never costs more
 * than just revising the whole book would.
 */
export function getRevisionCreditCost(chaptersRevised: number): number {
  return Math.min(chaptersRevised * CREDIT_COST.revision_chapter, CREDIT_COST.revision_full);
}

// Studio is deliberately NOT unlimited — 999 credits/month is a high but
// specific "generous fair-use" allotment, enforced through the exact same
// getCreditCost()/deductCredits() path used by every other plan (no more
// special-cased bypass branch in the generation routes).
export const PLAN_MONTHLY_CREDITS: Record<string, number | null> = {
  starter: 25, author: 50, studio: 999,
  creator: 25, 'author-pro': 50, free: 0,
};

// Rollover policy: unused monthly credits carry over up to the plan's own
// monthly amount (i.e. the rollover cap equals one more month's worth), so
// the maximum balance a subscriber can ever sit on is 2x their monthly
// allowance — Starter: 25/mo -> max 50 total, Author: 50/mo -> max 100
// total. Studio's volume (999/mo) makes rollover moot, but it's given a
// generous cap anyway rather than 0 so nothing is silently lost. Credit
// packs (purchasedCredits) are NOT subject to this cap — they're a separate
// pool purchased outside the subscription and never expire.
export const PLAN_ROLLOVER_CAP: Record<string, number> = {
  starter: 50, author: 100, studio: 500, creator: 50, 'author-pro': 100, free: 0,
};

// Credit packs — one-time top-ups on top of any subscription. Per-credit
// price is always higher than a subscription's per-credit rate (Starter:
// $19/25=$0.76/credit as a *combined* sub, but the credits themselves are
// effectively free with the sub; the comparison that matters is pack price
// vs. upgrading a tier) so packs never undercut upgrading to a higher plan.
export const CREDIT_PACKS = [
  { id: 'pack_starter', credits: 25, price: 700, label: 'Starter Pack' },
  { id: 'pack_standard', credits: 75, price: 1800, label: 'Standard Pack' },
  { id: 'pack_pro', credits: 200, price: 4400, label: 'Pro Pack' },
  { id: 'pack_agency', credits: 500, price: 9900, label: 'Agency Pack' },
] as const;

export type CreditPackId = typeof CREDIT_PACKS[number]['id'];

export function getCreditPack(id: string) {
  return CREDIT_PACKS.find(p => p.id === id) ?? null;
}

export function getContentSizeFromLength(bookLength: string): string {
  if (bookLength.includes('10,000')) return 'short';
  if (bookLength.includes('25,000')) return 'medium';
  if (bookLength.includes('50,000')) return 'standard';
  if (bookLength.includes('75,000')) return 'long';
  if (bookLength.includes('100,000')) return 'epic';
  return 'short';
}

// Emails that get unlimited generation access (whitelisted comped accounts —
// no credit checks, no subscription required) without being granted admin
// panel access. This is a small, hand-picked whitelist, NOT how the Studio
// plan works: Studio is a paid, credit-metered tier (see PLAN_MONTHLY_CREDITS
// above) with a generous fair-use limit, enforced the same as every other plan.
export const UNLIMITED_ACCESS_EMAILS = [
  "mariajoseruzaragon@gmail.com",
  "drjdsuarez@gmail.com",
  "jerelaf@gmail.com",
  "victoriastanzione@gmail.com",
];

export function hasUnlimitedAccess(email: string | null | undefined): boolean {
  return !!email && UNLIMITED_ACCESS_EMAILS.includes(email.toLowerCase().trim());
}

// ──── Credit deduction / refund helpers ─────────────────────────────────────
// Shared by every generation route so the "purchased -> monthly -> rollover"
// spend order and the insufficient-credits message stay identical everywhere.

export interface CreditBalance {
  purchasedCredits: number;
  monthlyCredits: number;
  creditsRollover: number;
}

export interface CreditDeduction {
  fromPurchased: number;
  fromMonthly: number;
  fromRollover: number;
}

export function getCreditCost(contentType: string): number {
  return CREDIT_COST[contentType] ?? CREDIT_COST.standard;
}

export function totalCredits(balance: CreditBalance): number {
  return balance.purchasedCredits + balance.monthlyCredits + balance.creditsRollover;
}

export function insufficientCreditsMessage(cost: number, have: number): string {
  return `You need ${cost} credits but only have ${have}. Purchase more or upgrade your plan.`;
}

// Spend order: purchased (pack) credits first, then monthly allowance, then
// rolled-over credits — subscription credits are used last since they're the
// ones that reset/expire on the next cycle.
export function planDeduction(balance: CreditBalance, cost: number): CreditDeduction {
  const fromPurchased = Math.min(balance.purchasedCredits, cost);
  const afterPurchased = cost - fromPurchased;
  const fromMonthly = Math.min(balance.monthlyCredits, afterPurchased);
  const afterMonthly = afterPurchased - fromMonthly;
  const fromRollover = Math.min(balance.creditsRollover, afterMonthly);
  return { fromPurchased, fromMonthly, fromRollover };
}

/** Deducts `cost` credits from `balance` (purchased -> monthly -> rollover) and persists it. */
export async function deductCredits(userId: string, balance: CreditBalance, cost: number): Promise<CreditDeduction> {
  const deduction = planDeduction(balance, cost);
  await prisma.user.update({
    where: { id: userId },
    data: {
      purchasedCredits: balance.purchasedCredits - deduction.fromPurchased,
      monthlyCredits: balance.monthlyCredits - deduction.fromMonthly,
      creditsRollover: balance.creditsRollover - deduction.fromRollover,
      creditsUsedThisMonth: { increment: cost },
      creditsUsedAllTime: { increment: cost },
    },
  });
  return deduction;
}

/** Restores a previous deduction to whichever pools it came from (used on generation failure). */
export async function refundCredits(userId: string, deduction: CreditDeduction | null | undefined): Promise<void> {
  if (!deduction) return;
  const total = deduction.fromPurchased + deduction.fromMonthly + deduction.fromRollover;
  if (total <= 0) return;
  await prisma.user.update({
    where: { id: userId },
    data: {
      purchasedCredits: { increment: deduction.fromPurchased },
      monthlyCredits: { increment: deduction.fromMonthly },
      creditsRollover: { increment: deduction.fromRollover },
      creditsUsedThisMonth: { decrement: total },
      creditsUsedAllTime: { decrement: total },
    },
  });
}
