import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const BUDGET = {
  maxPromptChars: 8000,
  maxOutputTokens: 4000,
};
