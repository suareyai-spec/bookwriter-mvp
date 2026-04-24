import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 25;

  // Gather recent activity from multiple sources
  const activities: any[] = [];

  if (!type || type === "signup") {
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, name: true, email: true, createdAt: true },
    });
    for (const u of recentUsers) {
      activities.push({
        type: "signup",
        description: `${u.name || u.email} signed up`,
        email: u.email,
        date: u.createdAt.toISOString(),
      });
    }
  }

  if (!type || type === "book") {
    const recentBooks = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, email: true } } },
    });
    for (const b of recentBooks) {
      activities.push({
        type: "book",
        description: `${b.user.name || b.user.email} ${b.status === "complete" ? "completed" : "started"} "${b.title}"`,
        email: b.user.email,
        date: b.createdAt.toISOString(),
      });
    }
  }

  if (!type || type === "subscription") {
    const recentSubs = await prisma.user.findMany({
      where: { subscriptionId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { name: true, email: true, subscriptionPlan: true, subscriptionStatus: true, createdAt: true },
    });
    for (const u of recentSubs) {
      activities.push({
        type: "subscription",
        description: `${u.name || u.email} ${u.subscriptionStatus === "active" ? "subscribed to" : "canceled"} ${u.subscriptionPlan || "plan"}`,
        email: u.email,
        date: u.createdAt.toISOString(),
      });
    }
  }

  // Sort by date descending
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = activities.length;
  const paginated = activities.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    activities: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
