-- Unified credit system: tracks credit consumption for admin visibility
-- (monthly usage resets alongside monthlyCredits; all-time never resets).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditsUsedThisMonth" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditsUsedAllTime" INTEGER NOT NULL DEFAULT 0;
