import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const plan = url.searchParams.get("plan") || "";
  const status = url.searchParams.get("status") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 25;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (plan) {
    if (plan === "none") {
      where.subscriptionPlan = null;
    } else {
      where.subscriptionPlan = plan;
    }
  }
  if (status) {
    if (status === "none") {
      where.subscriptionStatus = null;
    } else {
      where.subscriptionStatus = status;
    }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        monthlyBooksUsed: true,
        createdAt: true,
        stripeCustomerId: true,
        subscriptionId: true,
        monthlyResetDate: true,
        revisionCount: true,
        monthlyNewslettersUsed: true,
        _count: { select: { books: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      booksCount: u._count.books,
      _count: undefined,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { userId, subscriptionPlan, subscriptionStatus, resetUsage } = body;

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const data: any = {};
  if (subscriptionPlan !== undefined) data.subscriptionPlan = subscriptionPlan;
  if (subscriptionStatus !== undefined) data.subscriptionStatus = subscriptionStatus;
  if (resetUsage) {
    data.monthlyBooksUsed = 0;
    data.revisionCount = 0;
    data.monthlyNewslettersUsed = 0;
    data.monthlyResetDate = new Date();
  }

  const user = await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ user });
}
