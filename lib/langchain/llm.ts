import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { getGeminiApiKey, getGeminiFallbackApiKey } from "@/lib/api-keys";

/**
 * Primary LLM: Google Gemini 3.5 Flash
 * - High-speed, multimodal, low latency, robust tool calling
 * - maxRetries: 0 eliminates SDK retry amplification; retry and circuit breaker logic are handled centrally.
 */
const geminiPrimary = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash",
  temperature: 0,
  maxRetries: 0,
  apiKey: getGeminiApiKey(),
});

/**
 * Secondary Fallback LLM: Google Gemini 1.5 Flash
 * Automatically invoked when gemini-3.5-flash encounters daily quota exhaustion (429) or transient 5xx outages.
 */
const geminiFallback = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0,
  maxRetries: 0,
  apiKey: getGeminiFallbackApiKey(),
});

/** Resilient model with automatic fallback routing */
const geminiWithFallbacks = geminiPrimary.withFallbacks({
  fallbacks: [geminiFallback],
});

/** Backward-compatible export */
const gemini = geminiPrimary;

const qwen = new ChatOllama({
  model: "qwen3:8b",
  temperature: 0,
  numCtx: 3000,
});

const gpt = new ChatOllama({
  model: "gpt-oss:20b-cloud",
  temperature: 0,
});

export {
  gemini,
  geminiPrimary,
  geminiFallback,
  geminiWithFallbacks,
  qwen,
  gpt,
};
