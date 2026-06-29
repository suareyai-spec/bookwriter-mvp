import { prisma } from "@/lib/prisma";

// Claude Opus pricing (as of 2025):
// Input: $15 per 1M tokens
// Output: $75 per 1M tokens
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4-8": { input: 15, output: 75 },
  default: { input: 15, output: 75 },
};

export type CostType = "book" | "revision" | "special" | "newsletter" | "article" | "translation" | "humanizer";

export function estimateCost(inputTokens: number, outputTokens: number, model?: string): number {
  const pricing = PRICING[model || ""] || PRICING.default;
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}

export function getTokensFromResponse(response: any): { inputTokens: number; outputTokens: number } {
  return {
    inputTokens: response?.usage?.input_tokens || 0,
    outputTokens: response?.usage?.output_tokens || 0,
  };
}

export function estimateTokensFromText(text: string): number {
  // ~1 token per 4 characters for English
  return Math.ceil(text.length / 4);
}

export async function trackApiCost(params: {
  userId: string;
  type: CostType;
  inputTokens: number;
  outputTokens: number;
  model?: string;
  bookId?: string;
}): Promise<void> {
  try {
    const model = params.model || "claude-opus-4-8";
    const cost = estimateCost(params.inputTokens, params.outputTokens, model);
    await prisma.apiCost.create({
      data: {
        userId: params.userId,
        type: params.type,
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        cost,
        model,
        bookId: params.bookId,
      },
    });
  } catch (e) {
    // Fire-and-forget: don't crash generation
    console.error("[cost-tracker] Failed to track cost:", e);
  }
}

// Helper to track from an Anthropic response object
export function trackFromResponse(
  response: any,
  params: { userId: string; type: CostType; bookId?: string }
): void {
  const { inputTokens, outputTokens } = getTokensFromResponse(response);
  if (inputTokens > 0 || outputTokens > 0) {
    trackApiCost({ ...params, inputTokens, outputTokens }).catch(() => {});
  }
}
