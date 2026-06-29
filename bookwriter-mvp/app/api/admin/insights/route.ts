import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [allBooks, recentBooks, toneGroups, audienceGroups, languageGroups] = await Promise.all([
    prisma.book.findMany({
      select: { genre: true, tone: true, audience: true, bookLength: true, description: true, language: true, contentType: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.book.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { genre: true },
    }),
    prisma.book.groupBy({ by: ["tone"], _count: true, orderBy: { _count: { tone: "desc" } } }),
    prisma.book.groupBy({ by: ["audience"], _count: true, orderBy: { _count: { audience: "desc" } } }),
    prisma.book.groupBy({ by: ["language"], _count: true, orderBy: { _count: { language: "desc" } } }),
  ]);

  // Genre breakdown
  const genreMap: Record<string, number> = {};
  const genreRecentMap: Record<string, number> = {};
  for (const b of allBooks) {
    const g = b.genre || "Unspecified";
    genreMap[g] = (genreMap[g] || 0) + 1;
  }
  for (const b of recentBooks) {
    const g = b.genre || "Unspecified";
    genreRecentMap[g] = (genreRecentMap[g] || 0) + 1;
  }
  const byGenre = Object.entries(genreMap)
    .map(([genre, count]) => ({ genre, count, recent: genreRecentMap[genre] || 0 }))
    .sort((a, b) => b.count - a.count);

  // Content type breakdown
  const contentTypeMap: Record<string, number> = {};
  for (const b of allBooks) {
    const ct = b.contentType || "book";
    contentTypeMap[ct] = (contentTypeMap[ct] || 0) + 1;
  }
  const byContentType = Object.entries(contentTypeMap)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Book length breakdown
  const lengthMap: Record<string, number> = {};
  for (const b of allBooks) {
    const l = b.bookLength || "unspecified";
    lengthMap[l] = (lengthMap[l] || 0) + 1;
  }
  const byLength = Object.entries(lengthMap)
    .map(([length, count]) => ({ length, count }))
    .sort((a, b) => b.count - a.count);

  // Extract top topics from descriptions (keyword frequency)
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "about", "into", "through", "this", "that",
    "these", "those", "my", "your", "his", "her", "its", "our", "their",
    "i", "you", "he", "she", "it", "we", "they", "what", "which", "who",
    "how", "when", "where", "why", "not", "no", "so", "as", "if", "than",
    "then", "up", "out", "can", "book", "story", "novel", "write", "written",
  ]);

  const wordFreq: Record<string, number> = {};
  for (const b of allBooks) {
    const words = (b.description || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));
    for (const w of words) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }
  const topTopics = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word, count]) => ({ word, count }));

  // Tone stats
  const byTone = toneGroups
    .filter((t) => t.tone)
    .map((t) => ({ tone: t.tone!, count: t._count }));

  // Audience stats
  const byAudience = audienceGroups
    .filter((a) => a.audience)
    .map((a) => ({ audience: a.audience!, count: a._count }));

  // Language stats
  const byLanguage = languageGroups
    .filter((l) => l.language)
    .map((l) => ({ language: l.language!, count: l._count }));

  // Avg books per user
  const userBookCounts = await prisma.user.findMany({
    select: { _count: { select: { books: true } } },
  });
  const totalUsers = userBookCounts.length;
  const totalBooksSum = userBookCounts.reduce((s, u) => s + u._count.books, 0);
  const avgBooksPerUser = totalUsers > 0 ? (totalBooksSum / totalUsers).toFixed(1) : "0";

  // Generation trend: books per week over last 12 weeks
  const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000);
  const recentForTrend = await prisma.book.findMany({
    where: { createdAt: { gte: twelveWeeksAgo } },
    select: { createdAt: true },
  });
  const weekMap: Record<string, number> = {};
  for (const b of recentForTrend) {
    const d = new Date(b.createdAt);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    weekMap[key] = (weekMap[key] || 0) + 1;
  }
  const weeklyTrend = Object.entries(weekMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, count]) => ({ week, count }));

  return NextResponse.json({
    byGenre,
    byContentType,
    byLength,
    byTone,
    byAudience,
    byLanguage,
    topTopics,
    avgBooksPerUser,
    totalBooks: allBooks.length,
    totalUsers,
    weeklyTrend,
  });
}
