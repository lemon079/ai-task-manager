/**
 * Unified API Key & Secret Resolver
 *
 * Centralizes resolution of environment variables across the application, providing:
 * - Multi-alias resolution (e.g., GOOGLE_API_KEY vs GEMINI_API_KEY)
 * - Placeholder detection (e.g., "your-key-here", "PLACEHOLDER")
 * - Safe fallback defaults
 * - Single reusable source of truth across client and server
 */

/**
 * Checks if a string is a valid non-empty key (not undefined, empty, or placeholder)
 */
function isValidKey(val: string | undefined): val is string {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.length === 0) return false;
  if (
    trimmed.includes("PLACEHOLDER") ||
    trimmed.startsWith("your-") ||
    trimmed === "undefined" ||
    trimmed === "null"
  ) {
    return false;
  }
  return true;
}

/**
 * Universal resolver that checks candidate environment variables in order.
 * Returns the first valid, non-placeholder value found, or defaultValue.
 *
 * @param keys Single key name or array of candidate key names in priority order
 * @param defaultValue Optional fallback value if no key is set
 */
export function resolveApiKey(
  keys: string | string[],
  defaultValue?: string
): string | undefined {
  const candidates = Array.isArray(keys) ? keys : [keys];
  for (const key of candidates) {
    const val = process.env[key];
    if (isValidKey(val)) {
      return val.trim();
    }
  }
  return defaultValue;
}

// -------------------------------------------------------------------------
// Specialized Resolver Helpers for Reusability Across the Codebase
// -------------------------------------------------------------------------

/**
 * Resolves the Google Gemini API key.
 * Checks GOOGLE_API_KEY, GEMINI_API_KEY in order.
 */
export function getGeminiApiKey(): string | undefined {
  return resolveApiKey(["GOOGLE_API_KEY", "GEMINI_API_KEY"]);
}

/**
 * Resolves the fallback Google Gemini API key.
 */
export function getGeminiFallbackApiKey(): string | undefined {
  return (
    resolveApiKey(["GOOGLE_API_KEY_FALLBACK", "GEMINI_API_KEY_FALLBACK"]) ||
    getGeminiApiKey()
  );
}

/**
 * Returns true if a usable Gemini API key is configured.
 */
export function hasGeminiApiKey(): boolean {
  return Boolean(getGeminiApiKey());
}

/**
 * Resolves the Web Push VAPID public key.
 */
export function getVapidPublicKey(): string | undefined {
  return resolveApiKey([
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
    "VAPID_PUBLIC_KEY",
  ]);
}

/**
 * Resolves the Web Push VAPID private key.
 */
export function getVapidPrivateKey(): string | undefined {
  return resolveApiKey(["VAPID_PRIVATE_KEY"]);
}

/**
 * Resolves the Web Push VAPID subject contact.
 */
export function getVapidSubject(): string {
  return (
    resolveApiKey(["VAPID_SUBJECT"]) || "mailto:support@neuratask.app"
  );
}

/**
 * Resolves Pinecone API Key.
 */
export function getPineconeApiKey(): string | undefined {
  return resolveApiKey(["PINECONE_API_KEY"]);
}

/**
 * Resolves Cron Secret for scheduled worker sweeps.
 */
export function getCronSecret(): string | undefined {
  return resolveApiKey(["CRON_SECRET"]);
}

/**
 * Resolves NextAuth / Auth.js secret.
 */
export function getAuthSecret(): string | undefined {
  return resolveApiKey(["AUTH_SECRET", "NEXTAUTH_SECRET"]);
}
