export const ADMIN_EMAILS = ["suarey@gmail.com", "suareyai@gmail.com", "drjdsuarez@gmail.com", "support@iamdivid.com"];

export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export const PLANS = {
  free: {
    name: 'Free Starter',
    price: 0,
    monthlyBooks: 1, // lifetime, not monthly
    maxBookSize: 'short' as const,
    newsletters: 2,
    revisions: 1,
    translations: 'short-text' as const,
    additionalNewsletter: 0,
    additionalBooks: { short: 129, medium: 179, standard: 249, epic: 499 },
    concurrentGenerations: 1,
    formats: 'all' as const,
    priority: false,
  },
  creator: {
    name: 'Creator',
    price: 99,
    monthlyBooks: 1, // 1 medium or 1 short
    maxBookSize: 'medium' as const, // cannot do standard
    newsletters: 10,
    revisions: 30,
    translations: 'short-text' as const,
    additionalNewsletter: 5,
    additionalBooks: { short: 129, medium: 179, standard: 249, epic: 499 },
    concurrentGenerations: 1,
    formats: 'all' as const,
    priority: false,
  },
  'author-pro': {
    name: 'Author Pro',
    price: 199,
    monthlyBooks: 1, // 1 standard = 1 medium+1 short = 3 short
    maxBookSize: 'standard' as const,
    newsletters: 30,
    revisions: Infinity,
    translations: 'short-text' as const,
    additionalNewsletter: 4,
    additionalBooks: { short: 99, medium: 149, standard: 199, epic: 499 },
    concurrentGenerations: 1,
    formats: 'all' as const,
    priority: true,
  },
  studio: {
    name: 'Studio',
    price: 349,
    monthlyBooks: 2, // 1 standard + 1 medium, or combos
    maxBookSize: 'standard' as const,
    newsletters: Infinity, // fair use ~100
    revisions: Infinity,
    translations: 'unlimited' as const,
    additionalNewsletter: 0,
    additionalBooks: { short: 79, medium: 129, standard: 179, epic: 499 },
    concurrentGenerations: 2,
    formats: 'all' as const,
    priority: 'highest' as const,
  },
};

export type PlanId = keyof typeof PLANS;

export const BOOK_SIZES = {
  short: { label: 'Short', maxWords: 20000 },
  medium: { label: 'Medium', maxWords: 40000 },
  standard: { label: 'Standard', maxWords: 60000 },
  epic: { label: 'Epic', maxWords: Infinity },
};

export type BookSize = keyof typeof BOOK_SIZES;

// Book size equivalency in "book points" for monthly quota tracking
// Creator: 1 medium = 2 points, 1 short = 1 point (monthlyBooks=1 means 2 points)
// Author Pro: 1 standard = 3 points, 1 medium = 2, 1 short = 1 (monthlyBooks=1 means 3 points)
// Studio: 1 standard + 1 medium = 5 points (monthlyBooks=2 means 5 points)
export const BOOK_POINTS: Record<string, Record<string, number>> = {
  free: { short: 1 },
  creator: { short: 1, medium: 2 },
  'author-pro': { short: 1, medium: 2, standard: 3 },
  studio: { short: 1, medium: 2, standard: 3 },
};

export const MONTHLY_POINTS: Record<string, number> = {
  free: 1,
  creator: 2,       // 1 medium OR 2 short
  'author-pro': 3,  // 1 standard OR 1 medium+1 short OR 3 short
  studio: 5,        // 1 standard + 1 medium, or other combos
};

export const BOOK_SIZE_ORDER = ['short', 'medium', 'standard', 'epic'] as const;

export function canGenerateBookSize(plan: PlanId, size: string): boolean {
  const maxSize = PLANS[plan].maxBookSize;
  const maxIdx = BOOK_SIZE_ORDER.indexOf(maxSize as any);
  const sizeIdx = BOOK_SIZE_ORDER.indexOf(size as any);
  if (sizeIdx < 0) return false;
  return sizeIdx <= maxIdx;
}

export function getBookPoints(plan: PlanId, size: string): number {
  return BOOK_POINTS[plan]?.[size] ?? Infinity;
}

export const PREMIUM_PACKAGES = {
  'doctoral-thesis': { name: 'Doctoral-Level Thesis', price: 499 },
  'premium-playwright': { name: 'Premium Playwright', price: 399 },
  'premium-comic': { name: 'Premium Comic Book Script', price: 399 },
  'course-builder-pro': { name: 'Full Course Builder Pro', price: 399 },
  'multi-language-bundle': { name: 'Multi-Language Expansion', price: 249 },
} as const;

export type PremiumPackageId = keyof typeof PREMIUM_PACKAGES;

export const TEAM_SEAT_PRICE = 10; // per month

// Article feature config
export const ARTICLE_TYPES = [
  { key: "news", label: "News Article" },
  { key: "opinion", label: "Opinion / Editorial" },
  { key: "howto", label: "How-To Guide" },
  { key: "listicle", label: "Listicle" },
  { key: "profile", label: "Profile / Interview" },
  { key: "research", label: "Research & Analysis" },
  { key: "essay", label: "Personal Essay" },
  { key: "review", label: "Product Review" },
  { key: "casestudy", label: "Case Study" },
  { key: "thought", label: "Thought Leadership" },
] as const;

export type ArticleTypeKey = (typeof ARTICLE_TYPES)[number]["key"];

export const ARTICLE_TONES = [
  { key: "journalistic", label: "Journalistic", desc: "Objective, factual, AP-style" },
  { key: "conversational", label: "Conversational", desc: "Medium/blog style, personal voice" },
  { key: "academic", label: "Academic", desc: "Formal, research-backed" },
  { key: "provocative", label: "Provocative", desc: "Bold takes, engaging hooks" },
  { key: "storytelling", label: "Storytelling", desc: "Narrative-driven, immersive" },
  { key: "professional", label: "Professional", desc: "Business/corporate tone" },
] as const;

export const ARTICLE_WORD_COUNTS = [
  { key: "short", label: "Short (500-800 words)", target: 650 },
  { key: "standard", label: "Standard (1,000-1,500 words)", target: 1250 },
  { key: "longform", label: "Long-form (2,000-3,000 words)", target: 2500 },
  { key: "deepdive", label: "Deep Dive (4,000+ words)", target: 4500 },
] as const;

export const ARTICLE_LIMITS: Record<string, number> = {
  free: 2,
  creator: 5,
  "author-pro": 15,
  studio: 50, // fair use
};

export const ARTICLE_EXTRA_PRICE: Record<string, number> = {
  free: 7,
  creator: 7,
  "author-pro": 5,
  studio: 0,
};
