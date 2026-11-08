import { Pinecone } from "@pinecone-database/pinecone";
import { OllamaEmbeddings } from "@langchain/ollama";
import { getPineconeApiKey, resolveApiKey } from "@/lib/api-keys";

export const pinecone = new Pinecone({
  apiKey: getPineconeApiKey() || "",
});

export const task_embeddings_index = pinecone.index(
  resolveApiKey(["PINECONE_INDEX_NAME"], "task-embeddings")!
);

export const embeddings = new OllamaEmbeddings({
  model: "mxbai-embed-large:335m",
});
