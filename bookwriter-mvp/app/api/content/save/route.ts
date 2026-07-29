import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Backs ContentEditor's auto-save (every 30s + on blur). Unlike
// /api/books/edit (which creates a new BookVersion for an explicit
// "Save as New Version" action), this UPDATES the given version's content
// in place — auto-saving every 30s would otherwise flood Version History
// with near-duplicate versions from a single editing session.
const SaveSchema = z.object({
  bookId: z.string(),
  versionId: z.string().optional(),
  content: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = SaveSchema.parse(await req.json());
    const userId = (session.user as any).id;

    const book = await prisma.book.findFirst({ where: { id: body.bookId, userId } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const target = body.versionId
      ? await prisma.bookVersion.findFirst({ where: { id: body.versionId, bookId: body.bookId } })
      : await prisma.bookVersion.findFirst({ where: { bookId: body.bookId }, orderBy: { version: "desc" } });

    if (!target) {
      return NextResponse.json({ error: "No version to save to" }, { status: 404 });
    }

    const wordCount = body.content.split(/\s+/).filter(Boolean).length;

    const updated = await prisma.bookVersion.update({
      where: { id: target.id },
      data: { content: body.content, wordCount },
    });

    await prisma.book.update({ where: { id: body.bookId }, data: { updatedAt: new Date() } });

    return NextResponse.json({ success: true, versionId: updated.id, wordCount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
