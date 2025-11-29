/**
 * Embeddings Generation using OpenAI
 * Creates vector representations for semantic search
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(
  text: string
): Promise<EmbeddingResult> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return {
      embedding: response.data[0].embedding,
      tokens: response.usage?.total_tokens || 0,
    };
  } catch (error: any) {
    console.error("Failed to generate embedding:", error.message);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<EmbeddingResult[]> {
  try {
    // OpenAI allows up to 2048 inputs per batch for embeddings
    const batchSize = 100;
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batch,
        encoding_format: "float",
      });

      results.push(
        ...response.data.map((item) => ({
          embedding: item.embedding,
          tokens: response.usage?.total_tokens || 0,
        }))
      );
    }

    return results;
  } catch (error: any) {
    console.error("Failed to generate batch embeddings:", error.message);
    throw new Error(`Batch embedding generation failed: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Find most similar chunks to a query embedding
 */
export interface SimilarChunk {
  chunkId: string;
  content: string;
  similarity: number;
  heading?: string;
  metadata?: any;
}

export function findSimilarChunks(
  queryEmbedding: number[],
  chunks: Array<{
    id: string;
    content: string;
    embedding: number[];
    heading?: string;
    metadata?: any;
  }>,
  topK: number = 10,
  threshold: number = 0.7
): SimilarChunk[] {
  const similarities = chunks.map((chunk) => ({
    chunkId: chunk.id,
    content: chunk.content,
    heading: chunk.heading,
    metadata: chunk.metadata,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  return similarities
    .filter((s) => s.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
