import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/openai";
import { trackApiCost } from "@/lib/cost-tracker";
import { z } from "zod";

const ChatSchema = z.object({
  message: z.string().min(1).max(10000),
  selectedChapter: z.number().optional(),
  mode: z.enum(["chat", "edit", "rewrite"]),
});

function parseChapters(content: string): { title: string; content: string; startIndex: number; endIndex: number }[] {
  const chapters: { title: string; content: string; startIndex: number; endIndex: number }[] = [];
  const lines = content.split("\n");
  let currentChapter: { title: string; lines: string[]; startIndex: number } | null = null;
  let charIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isHeading = line.match(/^## (.+)/);

    if (isHeading) {
      if (currentChapter) {
        chapters.push({
          title: currentChapter.title,
          content: currentChapter.lines.join("\n"),
          startIndex: currentChapter.startIndex,
          endIndex: charIndex - 1,
        });
      }
      currentChapter = { title: isHeading[1].trim(), lines: [line], startIndex: charIndex };
    } else if (currentChapter) {
      currentChapter.lines.push(line);
    }

    charIndex += line.length + 1; // +1 for newline
  }

  if (currentChapter) {
    chapters.push({
      title: currentChapter.title,
      content: currentChapter.lines.join("\n"),
      startIndex: currentChapter.startIndex,
      endIndex: content.length,
    });
  }

  return chapters;
}

function extractEditedContent(response: string): string | undefined {
  const match = response.match(/```content\n([\s\S]*?)```/);
  return match ? match[1].trim() : undefined;
}

export async function POST(req: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;
  const userId = (session.user as any).id;

  const book = await prisma.book.findFirst({
    where: { id: bookId, userId },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const latestVersion = book.versions[0];
  if (!latestVersion) {
    return NextResponse.json({ error: "No content available" }, { status: 400 });
  }

  let body;
  try {
    body = ChatSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { message, selectedChapter, mode } = body;
  const fullContent = latestVersion.content;
  const chapters = parseChapters(fullContent);

  let targetContent = fullContent;
  let targetLabel = "Full Book";
  if (selectedChapter !== undefined && selectedChapter >= 0 && selectedChapter < chapters.length) {
    targetContent = chapters[selectedChapter].content;
    targetLabel = chapters[selectedChapter].title;
  }

  const systemPrompt = `You are an AI writing editor for Plot Ghost. You are helping the user edit their book titled "${book.title}".

CURRENT CONTENT (${targetLabel}):
${targetContent}

${chapters.length > 0 ? `\nBOOK STRUCTURE:\n${chapters.map((c, i) => `${i + 1}. ${c.title}`).join("\n")}\n` : ""}

MODES:
- "chat" mode: Answer questions about the book, suggest improvements, discuss changes. Do NOT output the full content -- just have a conversation.
- "edit" mode: Make the specific changes the user requested to the selected section. Output ONLY the edited section with a brief explanation of what you changed. Wrap the edited content in \`\`\`content markers.
- "rewrite" mode: Completely rewrite the selected section based on the user's instructions. Output the full rewritten section. Wrap the rewritten content in \`\`\`content markers.

Current mode: "${mode}"
${selectedChapter !== undefined ? `Selected section: ${targetLabel}` : "Working with: Full book"}

Important: When in edit or rewrite mode, always wrap the new content in \`\`\`content markers so the system can extract it. Keep your explanation brief and outside the content markers.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;

    trackApiCost({
      userId,
      type: "revision",
      inputTokens,
      outputTokens,
      model: "claude-sonnet-4-20250514",
      bookId,
    }).catch(() => {});

    const aiResponse = response.content
      .filter((block) => block.type === "text")
      .map((block) => {
        if (block.type === "text") return block.text;
        return "";
      })
      .join("");

    const editedContent = extractEditedContent(aiResponse);

    return NextResponse.json({
      response: aiResponse,
      editedContent: editedContent || undefined,
      chapterIndex: selectedChapter !== undefined ? selectedChapter : undefined,
    });
  } catch (error: any) {
    console.error("[book-chat] API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get AI response" },
      { status: 500 }
    );
  }
}
