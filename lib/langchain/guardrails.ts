/**
 * AI Agent Guardrails
 * Low-false-positive pre-filter for input validation and telemetry sanitization
 */

// Low-false-positive dangerous script injection and shell commands
const SCRIPT_INJECTION_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:\s*[^\s]+/i;
const DANGEROUS_COMMANDS_PATTERN = /\brm\s+-rf\b/i;

// Dangerous non-printable ASCII control characters (excluding newline, tab, cr)
const CONTROL_CHARACTERS_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

export interface GuardrailResult {
  passed: boolean;
  message: string;
  sanitizedInput?: string;
}

/**
 * Validate user input before sending to AI agent.
 * Avoids false-positive SQL / shell regexes since the agent has no SQL or bash execution tools.
 */
export function validateInput(input: string): GuardrailResult {
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return { passed: false, message: "Please enter a message." };
  }

  // Length limits
  if (input.length > 1000) {
    return {
      passed: false,
      message: "Message is too long. Please keep it under 1000 characters.",
    };
  }

  // Block control characters that can corrupt streams or protocol parsing
  if (CONTROL_CHARACTERS_PATTERN.test(input)) {
    return {
      passed: false,
      message: "Your request contains invalid control characters.",
    };
  }

  // Block script injections or dangerous commands
  if (SCRIPT_INJECTION_PATTERN.test(input) || DANGEROUS_COMMANDS_PATTERN.test(input)) {
    console.warn("[GUARDRAIL] Blocked malicious script or command injection attempt.");
    return {
      passed: false,
      message: "Your request contains disallowed script or command patterns.",
    };
  }

  return {
    passed: true,
    message: "Input validated",
    sanitizedInput: input.trim(),
  };
}

/**
 * Sanitize telemetry and logs to prevent sensitive credential leakage in console/cloud logs.
 * Note: Never mangles user-facing responses so phone numbers and dates remain intact.
 */
export function redactSensitiveForLogs(text: string): string {
  if (!text) return text;
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL_MASKED]")
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, "[CARD_MASKED]")
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN_MASKED]");
}

/**
 * User-facing output sanitizer.
 * Preserves user's legitimate content (phone numbers, titles, emails, numbers) intact.
 * Only strips raw script execution tags.
 */
export function sanitizeOutput(output: string): string {
  if (!output) return output;
  // Strip dangerous script tags while preserving markdown formatting
  return output.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

/**
 * Validates agent output
 */
export function validateOutput(output: string): GuardrailResult {
  if (!output || output.trim().length === 0) {
    return { passed: false, message: "No response generated." };
  }
  return { passed: true, message: "Output validated" };
}

/**
 * Combined guardrail check for input
 */
export function applyInputGuardrails(input: string): GuardrailResult {
  return validateInput(input);
}

/**
 * Combined guardrail check for output
 */
export function applyOutputGuardrails(output: string): string {
  const validation = validateOutput(output);
  if (!validation.passed) {
    return validation.message;
  }
  return sanitizeOutput(output);
}
