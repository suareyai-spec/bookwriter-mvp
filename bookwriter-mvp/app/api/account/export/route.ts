import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      monthlyCredits: true,
      purchasedCredits: true,
      creditsRollover: true,
      hasSeenOnboarding: true,
      emailVerified: true,
      books: {
        select: {
          id: true,
          title: true,
          description: true,
          genre: true,
          tone: true,
          audience: true,
          language: true,
          bookLength: true,
          contentType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          chapters: {
            select: { number: true, title: true, content: true, wordCount: true },
            orderBy: { number: "asc" },
          },
          versions: {
            select: { version: true, content: true, wordCount: true, notes: true, createdAt: true },
          },
        },
      },
    },
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const exportData = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      monthlyCredits: user.monthlyCredits,
      purchasedCredits: user.purchasedCredits,
      creditsRollover: user.creditsRollover,
    },
    books: user.books,
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="plotghost-data-export.json"`,
    },
  });
}
