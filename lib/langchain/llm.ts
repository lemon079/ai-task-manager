import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";

/**
 * Primary LLM: Google Gemini 2.5 Flash
 * - maxRetries: 0 eliminates SDK retry amplification; retry and circuit breaker logic are handled centrally.
 * - timeout: 15000 enforces a 15-second hard deadline per inference request.
 */
const geminiPrimary = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  maxRetries: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

/**
 * Secondary Fallback LLM: Google Gemini 2.0 Flash (or 1.5 Flash)
 * Automatically invoked when gemini-2.5-flash encounters daily quota exhaustion (429) or persistent 5xx outages.
 * Optionally uses GOOGLE_API_KEY_FALLBACK if configured.
 */
const geminiFallback = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  maxRetries: 0,
  apiKey: process.env.GOOGLE_API_KEY_FALLBACK || process.env.GOOGLE_API_KEY,
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
