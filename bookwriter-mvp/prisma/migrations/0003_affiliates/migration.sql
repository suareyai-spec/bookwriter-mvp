CREATE TABLE "Affiliate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "commissionPercent" INTEGER NOT NULL DEFAULT 20,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payoutStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Affiliate_code_key" ON "Affiliate"("code");

CREATE TABLE "AffiliateConversion" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "userEmail" TEXT,
    "stripeSessionId" TEXT,
    "plan" TEXT,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "commissionUsd" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AffiliateConversion_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AffiliateConversion" ADD CONSTRAINT "AffiliateConversion_affiliateId_fkey"
  FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
