-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to Project table
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "embedding" vector(2048);

-- Create HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS "Project_embedding_idx" ON "Project" USING hnsw ("embedding" vector_cosine_ops);
