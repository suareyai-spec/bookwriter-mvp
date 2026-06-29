-- AlterTable: add new Book columns
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "currentChapter" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "totalChapters" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "storyBible" TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "outline" TEXT;

-- CreateTable: Chapter
CREATE TABLE IF NOT EXISTS "Chapter" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- UniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Chapter_bookId_number_key" ON "Chapter"("bookId", "number");

-- ForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT IF EXISTS "Chapter_bookId_fkey";
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
