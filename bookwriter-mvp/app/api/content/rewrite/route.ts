import { z } from "zod";
import { anthropic } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/config";
import { rateLimitByUser } from "@/lib/rate-limit";
import { trackApiCost, getTokensFromResponse } from "@/lib/cost-tracker";
import { getCreditCost, hasUnlimitedAccess, totalCredits, deductCredits, refundCredits, insufficientCreditsMessage, CreditDeduction } from "@/lib/credits";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const Body = z.object({
  selectedText: z.string().min(1).max(10000),
  instruction: z.string().min(1).max(500),
  context: z.string().max(4000).optional(),
});

const SYSTEM_PROMPT = "You are a precise writing editor. The user has selected a passage and given you an instruction. Rewrite ONLY the selected passage according to the instruction. Match the tone and style of the surrounding context. Return only the rewritten text — no explanation, no preamble, no quotes around it.";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: "Please sign in." }, { status: 401 });
    }
    const userId = (session.user as any).id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const rl = await rateLimitByUser("content-rewrite", 60, 60 * 60 * 1000);
    if (rl.blocked) return rl.blocked;

    const body = Body.parse(await req.json());

    let creditDeduction: CreditDeduction | null = null;

    if (!isAdmin(user.email) && !hasUnlimitedAccess(user.email)) {
      const creditCost = getCreditCost("content_rewrite");
      const balance = {
        purchasedCredits: (user as any).purchasedCredits ?? 0,
        monthlyCredits: (user as any).monthlyCredits ?? 0,
        creditsRollover: (user as any).creditsRollover ?? 0,
      };
      const have = totalCredits(balance);

      if (have < creditCost) {
        return Response.json({
          error: insufficientCreditsMessage(creditCost, have),
          needsCredits: true,
          creditCost,
          totalCredits: have,
        }, { status: 403 });
      }

      creditDeduction = await deductCredits(userId, balance, creditCost);
    }

    try {
      const prompt = `${body.context ? `Surrounding context (for tone/style reference only — do not rewrite this part):\n"""\n${body.context}\n"""\n\n` : ""}Selected passage to rewrite:
"""
${body.selectedText}
"""

Instruction: ${body.instruction}

Rewrite the selected passage now:`;

      const resp = await anthropic.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });

      const { inputTokens, outputTokens } = getTokensFromResponse(resp);
      trackApiCost({ userId, type: "content_rewrite", inputTokens, outputTokens }).catch(() => {});

      const rewrittenText = resp.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("\n")
        .trim();

      if (!rewrittenText) {
        throw new Error("Empty rewrite response");
      }

      return Response.json({ rewrittenText });
    } catch (err) {
      await refundCredits(userId, creditDeduction).catch((refundErr) => console.error('[content/rewrite] credit refund failed:', refundErr));
      const message = err instanceof Error ? err.message : "Rewrite failed";
      return Response.json({ error: message }, { status: 500 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
