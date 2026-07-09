ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "monthlyCredits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "purchasedCredits" INTEGER NOT NULL DEFAULT 0;

UPDATE "User" SET "monthlyCredits" = CASE
  WHEN "subscriptionPlan" = 'studio' THEN 999
  WHEN "subscriptionPlan" IN ('author-pro', 'author') THEN 50
  WHEN "subscriptionPlan" IN ('creator', 'starter') THEN 25
  ELSE 0
END
WHERE "subscriptionStatus" = 'active';
