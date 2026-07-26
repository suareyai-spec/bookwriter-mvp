import { prisma } from "@/lib/prisma";

export const CREDIT_COST: Record<string, number> = {
  short: 5, medium: 10, standard: 16, long: 22, epic: 30,
  thesis: 16, course: 16, comic: 8, play: 8,
  article: 2, newsletter: 2, translation: 4,
  // A 12-15 week university course generates roughly 20-30 model calls
  // (syllabus + weekly outlines + 12-15 weekly lectures + assessment package)
  // and comparable-or-greater total word volume to an Epic book (30 credits),
  // plus structurally distinct content (quizzes with answer keys, rubrics,
  // midterm/final) an Epic book doesn't have — priced above Epic to reflect that.
  university_course: 45,
};

export const PLAN_MONTHLY_CREDITS: Record<string, number | null> = {
  starter: 25, author: 50, studio: null,
  creator: 25, 'author-pro': 50, free: 0,
};

export const PLAN_ROLLOVER_CAP: Record<string, number> = {
  starter: 50, author: 100, studio: 0, creator: 50, 'author-pro': 100, free: 0,
};

export const CREDIT_PACKS = [
  { id: 'pack_15', credits: 15, price: 1200, label: '15 credits' },
  { id: 'pack_35', credits: 35, price: 2500, label: '35 credits' },
  { id: 'pack_75', credits: 75, price: 4900, label: '75 credits' },
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

export function isUnlimitedPlan(plan: string | null | undefined): boolean {
  return plan === 'studio';
}

// Emails that get unlimited generation access (same as Studio — no credit checks,
// no subscription required) without being granted admin panel access.
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

// Spend order: purchased credits first, then monthly allowance, then rolled-over credits.
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
    },
  });
}
