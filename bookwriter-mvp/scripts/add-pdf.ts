/**
 * Admin utility to add a single new source to the RAG knowledge base after
 * initial ingestion — chunks a text file, embeds each chunk, and inserts it
 * into knowledge_embeddings tagged with the given content_type.
 *
 * The input must already be extracted plain text (not a raw PDF).
 *
 * Usage:
 *   npx ts-node scripts/add-pdf.ts --file="path/to/file.txt" --type="course"
 *
 * content_type should be one of: book, course, newsletter, academic,
 * translation, whitepaper — but any string is accepted so new categories
 * can be introduced without editing this script.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { chunkText, generateEmbedding, insertEmbedding } from "../lib/embeddings";

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of argv) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return args;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.file) {
    console.error('Missing --file="path/to/file.txt"');
    process.exit(1);
  }
  if (!args.type) {
    console.error('Missing --type="course" (or book, newsletter, academic, translation, whitepaper)');
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set. Add it to your environment before running this script.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to your environment before running this script.");
    process.exit(1);
  }

  const filePath = path.resolve(args.file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const text = fs.readFileSync(filePath, "utf-8");
  if (!text.trim()) {
    console.error(`File is empty: ${filePath}`);
    process.exit(1);
  }

  const sourceFile = path.basename(filePath);
  const chunks = chunkText(text, 500, 50);
  console.log(`"${sourceFile}" (${args.type}) — ${chunks.length} chunks`);

  let succeeded = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const embedding = await generateEmbedding(chunk);
      await insertEmbedding({
        content: chunk,
        embedding,
        sourceFile,
        contentType: args.type,
        metadata: { chunkIndex: i, totalChunks: chunks.length },
      });
      succeeded++;
      process.stdout.write(`\rembedded ${i + 1}/${chunks.length}`);
    } catch (err) {
      console.error(`\n[error] chunk ${i + 1}/${chunks.length} failed:`, err instanceof Error ? err.message : err);
    }
    await sleep(50);
  }

  console.log(`\nDone — ${succeeded}/${chunks.length} chunks embedded and inserted.`);
}

main().catch((err) => {
  console.error("add-pdf failed:", err);
  process.exit(1);
});
