ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredBy" TEXT;

ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "payPalEmail" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.30;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "pendingPayout" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Affiliate_userId_key') THEN
    CREATE UNIQUE INDEX "Affiliate_userId_key" ON "Affiliate"("userId");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Affiliate_userId_fkey') THEN
    ALTER TABLE "Affiliate" ADD CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "AffiliateClick" (
  "id" TEXT NOT NULL,
  "affiliateId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AffiliateClick_affiliateId_fkey') THEN
    ALTER TABLE "AffiliateClick" ADD CONSTRAINT "AffiliateClick_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
