export const PLANS: Record<string, { accounts: number; posts: number; captions: number; reports: number; price: number }> = {
  starter: { accounts: 5, posts: 500, captions: 50, reports: 1, price: 29 },
  growth: { accounts: 25, posts: 2500, captions: 200, reports: 5, price: 79 },
  agency: { accounts: -1, posts: -1, captions: -1, reports: -1, price: 199 }, // -1 = unlimited
};

// Admin emails get unlimited free access (bypass all billing and usage limits)
export const ADMIN_EMAILS = [
  'suarey@gmail.com',
  'suareyai@gmail.com',
  'david@narevo.io',
  'pablo@narevo.io',
];
