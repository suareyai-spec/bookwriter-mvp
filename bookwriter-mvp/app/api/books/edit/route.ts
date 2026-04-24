import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const EditSchema = z.object({
  bookId: z.string(),
  title: z.string().min(1).optional(),
  content: z.string().min(1),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = EditSchema.parse(await req.json());
    const userId = (session.user as any).id;

    const book = await prisma.book.findFirst({ where: { id: body.bookId, userId } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const lastVersion = await prisma.bookVersion.findFirst({
      where: { bookId: body.bookId },
      orderBy: { version: "desc" },
    });

    const wordCount = body.content.split(/\s+/).filter(Boolean).length;

    const version = await prisma.bookVersion.create({
      data: {
        bookId: body.bookId,
        version: (lastVersion?.version || 0) + 1,
        content: body.content,
        wordCount,
        notes: body.notes || "Manual edit",
      },
    });

    // Update title if provided
    if (body.title) {
      await prisma.book.update({ where: { id: body.bookId }, data: { title: body.title, updatedAt: new Date() } });
    } else {
      await prisma.book.update({ where: { id: body.bookId }, data: { updatedAt: new Date() } });
    }

    return NextResponse.json({ bookId: body.bookId, versionId: version.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
