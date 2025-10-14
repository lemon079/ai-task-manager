import { Pinecone } from "@pinecone-database/pinecone";
import { OllamaEmbeddings } from "@langchain/ollama";

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const task_embeddings_index = pinecone.index("task-embeddings"); // must exist in dashboard

export const embeddings = new OllamaEmbeddings({
  model: "mxbai-embed-large:335m",
});
