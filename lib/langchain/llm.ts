import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";

const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  maxRetries: 2,
  apiKey: process.env.GOOGLE_API_KEY,
});

const qwen = new ChatOllama({
  model: "qwen3:8b",
  temperature: 0,
  numCtx: 3000,
});

const gpt = new ChatOllama({
  model: "gpt-oss:20b-cloud",
  temperature: 0,
});

export { qwen, gemini, gpt };
