/**
 * Error Classification Engine
 * Categorizes LLM, tool, network, and quota failures into actionable resilience strategies.
 * Prevents retry amplification and short-circuits exhausted quotas to fallback chains.
 */

export type ErrorCategory =
  | "TRANSIENT"       // 502/503, brief RPM/TPM 429, socket reset. Retryable with exponential backoff & jitter.
  | "QUOTA_EXHAUSTED" // 429 RESOURCE_EXHAUSTED / GenerateRequestsPerDay. Non-retryable on current model; trigger failover.
  | "SCHEMA_SEMANTIC" // Tool schema, JSON parse, or Zod validation errors. Return to LLM as self-correction feedback.
  | "FATAL";          // 400 bad prompt, 401/403 invalid API key, safety blocks. Fast-abort run.

export interface ClassifiedError {
  category: ErrorCategory;
  isRetryable: boolean;
  retryDelayMs?: number;
  message: string;
  statusCode?: number;
  rawError?: unknown;
}

/**
 * Inspect error message, status codes, and headers to classify the failure
 */
export function classifyError(error: unknown): ClassifiedError {
  const err = error as any;
  const message: string =
    err?.message ||
    (typeof error === "string" ? error : JSON.stringify(error) || "Unknown error");

  const status: number | undefined =
    err?.status || err?.statusCode || err?.response?.status || err?.status_code;

  // 1. Quota Exhaustion (Google GenAI / Anthropic / OpenAI daily or tier quota limits)
  const isQuotaExhausted =
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("GenerateRequestsPerDay") ||
    message.includes("quota exceeded") ||
    message.includes("daily limit") ||
    message.includes("insufficient_quota") ||
    (status === 429 && (message.includes("per day") || message.includes("credit balance")));

  if (isQuotaExhausted) {
    return {
      category: "QUOTA_EXHAUSTED",
      isRetryable: false, // Non-retryable on this model; fail over to secondary model
      statusCode: 429,
      message: "Daily token quota or resource capacity exhausted for this model.",
      rawError: error,
    };
  }

  // 2. Transient Network / Server Errors & Short Rate Limits
  const isTransientStatus = status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
  const isTransientNetwork =
    message.includes("fetch failed") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT") ||
    message.includes("ECONNREFUSED") ||
    message.includes("socket hang up") ||
    message.includes("DEADLINE_EXCEEDED") ||
    message.includes("UNAVAILABLE") ||
    message.includes("timeout");

  if (isTransientStatus || isTransientNetwork) {
    // Check if retry-after is provided
    let retryDelayMs = 1000;
    const retryAfterHeader = err?.response?.headers?.get?.("retry-after") || err?.headers?.["retry-after"];
    if (retryAfterHeader) {
      const parsedSeconds = parseInt(retryAfterHeader, 10);
      if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
        retryDelayMs = parsedSeconds * 1000;
      }
    }

    // If retryDelay is greater than 60s, treat as quota exhaustion rather than hanging request
    if (retryDelayMs > 60000) {
      return {
        category: "QUOTA_EXHAUSTED",
        isRetryable: false,
        statusCode: 429,
        retryDelayMs,
        message: "Rate limit cooldown exceeds allowable request timeout; triggering fallback.",
        rawError: error,
      };
    }

    return {
      category: "TRANSIENT",
      isRetryable: true,
      statusCode: status || 503,
      retryDelayMs,
      message: `Transient provider error: ${message.slice(0, 150)}`,
      rawError: error,
    };
  }

  // 3. Schema / Parsing Errors (Self-correctable by LLM)
  const isSchemaError =
    message.includes("JSON") ||
    message.toLowerCase().includes("validation") ||
    message.includes("OutputParserException") ||
    message.includes("invalid_type") ||
    message.includes("Zod") ||
    err?.name === "ZodError";

  if (isSchemaError) {
    return {
      category: "SCHEMA_SEMANTIC",
      isRetryable: false,
      statusCode: 422,
      message: `Schema parsing or argument validation failure: ${message.slice(0, 200)}`,
      rawError: error,
    };
  }

  // 4. Fatal Errors (Auth failure, invalid API key, prompt violation)
  const isFatalStatus = status === 400 || status === 401 || status === 403;
  const isFatalMessage =
    message.includes("API key not valid") ||
    message.includes("API_KEY_INVALID") ||
    message.includes("PERMISSION_DENIED") ||
    message.includes("Unauthorized");

  if (isFatalStatus || isFatalMessage) {
    return {
      category: "FATAL",
      isRetryable: false,
      statusCode: status || 401,
      message: `Fatal authentication or authorization error: ${message.slice(0, 150)}`,
      rawError: error,
    };
  }

  // Default fallback classification
  return {
    category: "TRANSIENT",
    isRetryable: true,
    statusCode: status || 500,
    message: message.slice(0, 200),
    rawError: error,
  };
}
