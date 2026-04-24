import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 300_000, // 5 minutes per API call
  maxRetries: 2,
});

export const BUDGET = {
  maxPromptChars: 8000,
  maxOutputTokens: 16384,
};
