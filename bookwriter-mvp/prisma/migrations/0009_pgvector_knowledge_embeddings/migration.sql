-- RAG knowledge base: curated writing-style passages, embedded with
-- OpenAI text-embedding-3-small (1536 dims) and retrieved by cosine
-- similarity to inject style examples into generation prompts.
--
-- This table is intentionally NOT modeled in schema.prisma — it's queried
-- directly via @neondatabase/serverless (see lib/embeddings.ts) since
-- Prisma's client has no native `vector` type support.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS "knowledge_embeddings" (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),
  source_file TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'book', 'course', 'newsletter', 'academic', 'translation', 'whitepaper'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS knowledge_embeddings_embedding_idx
  ON "knowledge_embeddings"
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Every query filters WHERE content_type = ... before the vector search,
-- so this pays for itself immediately.
CREATE INDEX IF NOT EXISTS knowledge_embeddings_content_type_idx
  ON "knowledge_embeddings" (content_type);
