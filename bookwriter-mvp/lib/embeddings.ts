import { neon } from "@neondatabase/serverless";
import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

let sqlClient: ReturnType<typeof neon> | null = null;
function getSql(): ReturnType<typeof neon> | null {
  if (!process.env.DATABASE_URL) return null;
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL);
  return sqlClient;
}

export interface KnowledgeMatch {
  content: string;
  source_file: string;
  metadata: Record<string, unknown> | null;
}

/** Calls OpenAI text-embedding-3-small and returns a 1536-dim vector. */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();
  if (!openai) throw new Error("OPENAI_API_KEY is not configured");

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

/**
 * Searches knowledge_embeddings for the passages most similar to `query`,
 * restricted to `contentType`, ranked by cosine similarity.
 * Returns [] on any failure (missing config, unreachable DB, empty table,
 * etc.) so callers never need their own try/catch around this.
 */
export async function searchSimilarContent(
  query: string,
  contentType: string,
  limit: number = 3
): Promise<KnowledgeMatch[]> {
  try {
    const sql = getSql();
    if (!sql) return [];

    const embedding = await generateEmbedding(query);
    const vectorLiteral = toVectorLiteral(embedding);

    const rows = await sql`
      SELECT content, source_file, metadata
      FROM knowledge_embeddings
      WHERE content_type = ${contentType}
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `;

    return rows as unknown as KnowledgeMatch[];
  } catch (err) {
    console.error("[embeddings] searchSimilarContent failed:", err);
    return [];
  }
}

/**
 * Retrieves style examples for `topic`/`contentType` and formats them as a
 * ready-to-inject prompt block, labeled with STYLE REFERENCE markers. Returns
 * an empty string if nothing is found (or on any failure) — callers can
 * always append the result directly to a prompt with no extra branching.
 */
export async function getStyleExamples(topic: string, contentType: string): Promise<string> {
  const results = await searchSimilarContent(topic, contentType, 3);
  if (!results.length) return "";

  const examples = results
    .map((r, i) => `Example ${i + 1}: ${r.content}`)
    .join("\n\n");

  const body = `Here are examples of excellent ${contentType} writing on related topics. Study the voice, structure, and specificity — write at this level:

${examples}`;

  return `--- STYLE REFERENCE (match this quality and voice) ---
${body}
--- END STYLE REFERENCE ---`;
}

/** Inserts a single embedded chunk. Used by the ingestion scripts. */
export async function insertEmbedding(params: {
  content: string;
  embedding: number[];
  sourceFile: string;
  contentType: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL is not configured");

  const vectorLiteral = toVectorLiteral(params.embedding);
  await sql`
    INSERT INTO knowledge_embeddings (content, embedding, source_file, content_type, metadata)
    VALUES (
      ${params.content},
      ${vectorLiteral}::vector,
      ${params.sourceFile},
      ${params.contentType},
      ${params.metadata ? JSON.stringify(params.metadata) : null}::jsonb
    )
  `;
}

/**
 * Splits text into ~`chunkWords`-word passages with `overlapWords` of
 * overlap between consecutive chunks, so context isn't lost at chunk
 * boundaries. Shared by scripts/ingest-pdfs.ts and scripts/add-pdf.ts.
 */
export function chunkText(text: string, chunkWords: number = 500, overlapWords: number = 50): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  const step = Math.max(1, chunkWords - overlapWords);

  for (let start = 0; start < words.length; start += step) {
    const chunk = words.slice(start, start + chunkWords).join(" ");
    if (chunk.trim()) chunks.push(chunk);
    if (start + chunkWords >= words.length) break;
  }

  return chunks;
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };
