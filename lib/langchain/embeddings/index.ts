import { Pinecone } from "@pinecone-database/pinecone";
import { OllamaEmbeddings } from "@langchain/ollama";

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const task_embeddings_index = pinecone.index(
  process.env.PINECONE_INDEX_NAME || "task-embeddings"
);

export const embeddings = new OllamaEmbeddings({
  model: "mxbai-embed-large:335m",
});
