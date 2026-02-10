import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ReferenceSchema = z.object({
  name: z.string(),
  type: z.string(),
  content: z.string(),
});

const SaveSchema = z.object({
  bookId: z.string().optional(),
  title: z.string().min(1),
  description: z.string(),
  genre: z.string().optional(),
  tone: z.string().optional(),
  audience: z.string().optional(),
  language: z.string().optional(),
  bookLength: z.string().optional(),
  content: z.string(),
  notes: z.string().optional(),
  references: z.array(ReferenceSchema).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = SaveSchema.parse(await req.json());
    const userId = (session.user as any).id;
    const wordCount = body.content.split(/\s+/).filter(Boolean).length;

    if (body.bookId) {
      // Add new version to existing book
      const book = await prisma.book.findFirst({ where: { id: body.bookId, userId } });
      if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }

      const lastVersion = await prisma.bookVersion.findFirst({
        where: { bookId: body.bookId },
        orderBy: { version: "desc" },
      });

      const version = await prisma.bookVersion.create({
        data: {
          bookId: body.bookId,
          version: (lastVersion?.version || 0) + 1,
          content: body.content,
          wordCount,
          notes: body.notes,
        },
      });

      // Save new references if provided
      if (body.references?.length) {
        await prisma.bookReference.createMany({
          data: body.references.map(r => ({
            name: r.name,
            type: r.type,
            content: r.content,
            bookId: body.bookId!,
          })),
        });
      }

      await prisma.book.update({ where: { id: body.bookId }, data: { updatedAt: new Date() } });

      return NextResponse.json({ bookId: body.bookId, versionId: version.id });
    } else {
      // Create new book with first version
      const book = await prisma.book.create({
        data: {
          title: body.title,
          description: body.description,
          genre: body.genre,
          tone: body.tone,
          audience: body.audience,
          language: body.language,
          bookLength: body.bookLength,
          userId,
          versions: {
            create: {
              version: 1,
              content: body.content,
              wordCount,
              notes: body.notes || "Initial generation",
            },
          },
          ...(body.references?.length ? {
            references: {
              create: body.references.map(r => ({
                name: r.name,
                type: r.type,
                content: r.content,
              })),
            },
          } : {}),
        },
      });

      return NextResponse.json({ bookId: book.id });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
