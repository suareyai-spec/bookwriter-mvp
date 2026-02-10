import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const BUDGET = {
  maxPromptChars: 8000,
  maxOutputTokens: 4096,
};
