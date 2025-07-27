import { pipeline, env } from '@xenova/transformers';

// Configure transformers to use local models
env.allowLocalModels = false;
env.allowRemoteModels = true;

let embeddingPipeline: any = null;

export async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    try {
      // Use a lightweight sentence transformer model
      embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    } catch (error) {
      console.error('Error loading embedding model:', error);
      throw error;
    }
  }
  return embeddingPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const pipeline = await getEmbeddingPipeline();
    const result = await pipeline(text, { pooling: 'mean', normalize: true });
    
    // Convert to regular array and ensure numbers
    const embedding = Array.from(result.data) as number[];
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const pipeline = await getEmbeddingPipeline();
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const result = await pipeline(text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(result.data) as number[];
      embeddings.push(embedding);
    }
    
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
} 