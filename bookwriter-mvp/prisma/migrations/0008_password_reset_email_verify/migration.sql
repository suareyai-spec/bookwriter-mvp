ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifyToken" TEXT;

-- Grandfather in everyone who already had an account before email verification
-- existed — only new signups going forward need to click the verification link.
UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" = false;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_resetToken_key') THEN
    CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_verifyToken_key') THEN
    CREATE UNIQUE INDEX "User_verifyToken_key" ON "User"("verifyToken");
  END IF;
END $$;
