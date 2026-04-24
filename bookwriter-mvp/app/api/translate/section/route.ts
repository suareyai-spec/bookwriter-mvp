import { z } from "zod";
import { anthropic } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { rateLimitByUser } from "@/lib/rate-limit";
import { humanizeChapter } from "@/lib/humanizer";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const Body = z.object({
  content: z.string().min(1),
  targetLanguage: z.string().min(1),
  sectionIndex: z.number(),
});

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  try {
    const rl = await rateLimitByUser("translate-section", 30, 60 * 60 * 1000);
    if (rl.blocked) return rl.blocked;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Please sign in." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const userId = (session.user as any).id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    if (!isAdmin(user.email || "")) {
      const isActive = user.subscriptionStatus === "active";
      const isFreeUser = !isActive && !user.subscriptionPlan;
      if (isFreeUser) {
        // Monthly reset for free users
        if (user.monthlyResetDate && new Date() > user.monthlyResetDate) {
          await prisma.user.update({ where: { id: userId }, data: { freeTranslationsUsed: 0, monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
          (user as any).freeTranslationsUsed = 0;
        }
        if (!user.monthlyResetDate) {
          await prisma.user.update({ where: { id: userId }, data: { monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
        }
        const freeTranslationsUsed = (user as any).freeTranslationsUsed || 0;
        if (freeTranslationsUsed >= 2) {
          return new Response(JSON.stringify({ error: "You've reached your Free Starter translation limit for this month. Upgrade to unlock more.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        await prisma.user.update({ where: { id: userId }, data: { freeTranslationsUsed: { increment: 1 } } });
      } else if (!isActive) {
        const credit = await prisma.bookCredit.findFirst({ where: { userId, used: false } });
        if (!credit) {
          return new Response(JSON.stringify({ error: "Subscription required.", needsSubscription: true }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
      }
    }

    const body = Body.parse(await req.json());

    const prompt = `Translate the following text into ${body.targetLanguage}.

RULES:
- Translate ONLY what is written. Do NOT add anything — no extra words, no filler, no commentary.
- Preserve the author's tone, voice, and style exactly.
- Preserve ALL formatting: headers, bold, italic, lists, paragraph breaks.
- Idioms should use natural ${body.targetLanguage} equivalents.
- Do NOT summarize, expand, explain, or editorialize. Just translate.

OUTPUT: Return ONLY the translated text. Nothing else.

Text to translate:

${body.content}`;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", status: "translating" })));

          const resp = await anthropic.messages.create({
            model: "claude-opus-4-20250514",
            max_tokens: 8192,
            messages: [{ role: "user", content: prompt }],
          });
          let translated = resp.content
            .filter((b) => b.type === "text")
            .map((b) => (b as { type: "text"; text: string }).text)
            .join("\n");

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "progress", status: "polishing" })));
          translated = await humanizeChapter(translated);

          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "complete", content: translated, sectionIndex: body.sectionIndex })));
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed";
          controller.enqueue(new TextEncoder().encode(sseEvent({ type: "error", message })));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
