/**
 * One-time ingestion script for the curated PDF library that seeds
 * knowledge_embeddings for the RAG style-reference system.
 *
 * This script does NOT parse PDFs itself — it accepts already-extracted
 * plain text piped in via stdin (extract each PDF to text yourself, however
 * you prefer, then pipe the result in here).
 *
 * Two ways to run it:
 *
 * 1) Multi-source input — pipe in several sources at once, each preceded by
 *    a "## SOURCE: <name>" marker line matching one of the names below:
 *
 *      cat library/*.txt | npx ts-node scripts/ingest-pdfs.ts
 *
 *    (build library/*.txt so each file starts with its own "## SOURCE: ..."
 *    line, or just cat them together with the markers already in place)
 *
 * 2) Single-source input — pipe in one source's text and name it explicitly:
 *
 *      cat "wired-for-story.txt" | npx ts-node scripts/ingest-pdfs.ts --source="Wired for Story"
 *
 * Known sources and their content_type tag:
 *   Wired for Story                    -> book
 *   Newsletter Ninja                   -> newsletter
 *   Write it Up                        -> academic
 *   IFRA Course Creation               -> course
 *   Ultimate Guide to Online Courses   -> course
 *   IO2 Digital Course Guidelines      -> course
 *   Thinking Spanish Translation       -> translation
 *   Antibiotic Resistance paper        -> academic
 *
 * An unrecognized source name is rejected unless --type="..." is also
 * passed to tag it explicitly.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { chunkText, generateEmbedding, insertEmbedding } from "../lib/embeddings";

const SOURCE_CONTENT_TYPE: Record<string, string> = {
  "Wired for Story": "book",
  "Newsletter Ninja": "newsletter",
  "Write it Up": "academic",
  "IFRA Course Creation": "course",
  "Ultimate Guide to Online Courses": "course",
  "IO2 Digital Course Guidelines": "course",
  "Thinking Spanish Translation": "translation",
  "Antibiotic Resistance paper": "academic",
};

const SOURCE_MARKER = /^##\s*SOURCE:\s*(.+?)\s*$/;

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of argv) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return args;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf-8");
}

/** Splits multi-source input on "## SOURCE: <name>" marker lines. */
function splitSources(raw: string): { source: string; text: string }[] {
  const lines = raw.split("\n");
  const sections: { source: string; text: string }[] = [];
  let currentSource: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const match = line.match(SOURCE_MARKER);
    if (match) {
      if (currentSource) sections.push({ source: currentSource, text: currentLines.join("\n").trim() });
      currentSource = match[1];
      currentLines = [];
    } else if (currentSource) {
      currentLines.push(line);
    }
  }
  if (currentSource) sections.push({ source: currentSource, text: currentLines.join("\n").trim() });

  return sections;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ingestSource(source: string, text: string, contentType: string): Promise<void> {
  if (!text.trim()) {
    console.warn(`  [skip] "${source}" has no text content`);
    return;
  }

  const chunks = chunkText(text, 500, 50);
  console.log(`  "${source}" (${contentType}) — ${chunks.length} chunks`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const embedding = await generateEmbedding(chunk);
      await insertEmbedding({
        content: chunk,
        embedding,
        sourceFile: source,
        contentType,
        metadata: { chunkIndex: i, totalChunks: chunks.length },
      });
      process.stdout.write(`\r    embedded ${i + 1}/${chunks.length}`);
    } catch (err) {
      console.error(`\n    [error] chunk ${i + 1}/${chunks.length} of "${source}" failed:`, err instanceof Error ? err.message : err);
    }
    // Light pacing to stay comfortably under OpenAI's embeddings rate limits
    // on large sources — this is a one-time script, not latency-sensitive.
    await sleep(50);
  }
  process.stdout.write("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set. Add it to your environment before running this script.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to your environment before running this script.");
    process.exit(1);
  }

  const raw = await readStdin();
  if (!raw.trim()) {
    console.error("No input received on stdin. Pipe extracted text in, e.g.:\n  cat book.txt | npx ts-node scripts/ingest-pdfs.ts --source=\"Wired for Story\"");
    process.exit(1);
  }

  const sections = splitSources(raw);

  // Single-source mode: no "## SOURCE:" markers found, expect --source (and optionally --type)
  const sourcesToIngest = sections.length > 0
    ? sections
    : args.source
      ? [{ source: args.source, text: raw }]
      : [];

  if (sourcesToIngest.length === 0) {
    console.error('No sources found. Either mark sections with "## SOURCE: <name>" lines, or pass --source="<name>" for single-source input.');
    process.exit(1);
  }

  console.log(`Ingesting ${sourcesToIngest.length} source(s)...\n`);

  for (const { source, text } of sourcesToIngest) {
    const contentType = args.type || SOURCE_CONTENT_TYPE[source];
    if (!contentType) {
      console.warn(`  [skip] "${source}" is not a known source and no --type="..." was provided`);
      continue;
    }
    await ingestSource(source, text, contentType);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
