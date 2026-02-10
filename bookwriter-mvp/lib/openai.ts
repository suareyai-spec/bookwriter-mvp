import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const BUDGET = {
  maxPromptChars: 7000,
  maxOutputTokens: 1400,
};
