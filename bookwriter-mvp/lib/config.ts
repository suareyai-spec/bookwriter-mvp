export const ADMIN_EMAILS = ["suarey@gmail.com", "suareyai@gmail.com", "drjdsuarez@gmail.com", "support@plotghost.ai", "dsuarey@gmail.com"];

export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Canonical site URL — all internal links, canonical tags, emails, and API
// callbacks should build off this instead of hardcoding the domain.
export const SITE_URL = "https://www.plotghost.ai";

// Plan display names — must stay in sync with PLANS in lib/stripe.ts (which
// holds prices too, but can't be imported into client components since it
// instantiates the server-only Stripe SDK). Use this anywhere a plan key needs
// to become a human-readable label so a plan never falls back to a stale name
// (e.g. the old "Pro Author" tier) in the UI.
const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: "Free Starter",
  starter: "Starter",
  author: "Author",
  studio: "Studio",
};

export function getPlanDisplayName(plan: string | null | undefined): string {
  return (plan && PLAN_DISPLAY_NAMES[plan]) || "Free Starter";
}

// Per-item premium packages (Doctoral Thesis, Premium Play/Comic/Course,
// Multi-Language Bundle) were removed entirely — PlotGhost is unified onto a
// single credit-based system (see lib/credits.ts). Every one of those
// products is now just a normal credit-metered generation.

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
  starter: 5,
  author: 15,
  studio: 50, // fair use
};

export const ARTICLE_EXTRA_PRICE: Record<string, number> = {
  free: 7,
  starter: 7,
  author: 5,
  studio: 0,
};
