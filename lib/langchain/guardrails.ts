/**
 * AI Agent Guardrails
 * Input validation and output sanitization for the task agent
 */

// Dangerous patterns that could indicate injection attempts
const DANGEROUS_PATTERNS = [
    // SQL injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)/i,
    // Code execution patterns
    /(\beval\s*\(|\bexec\s*\(|\bsystem\s*\(|\bos\.\w+\()/i,
    // Script injection
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    // Path traversal
    /\.\.\//g,
    // Command injection
    /[;&|`$]/,
];

// Off-topic keywords that indicate non-task-related requests
const OFF_TOPIC_PATTERNS = [
    /\b(password|credit card|ssn|social security|bank account)\b/i,
    /\b(hack|exploit|vulnerability|bypass|crack)\b/i,
    /\b(write code|generate script|create program|build app)\b/i,
    /\b(tell me a joke|write a poem|sing a song|play a game)\b/i,
    /\b(who is|what is the capital|history of|explain quantum)\b/i,
];

// Task-related keywords that indicate valid requests
const TASK_RELATED_KEYWORDS = [
    /\b(task|todo|reminder|deadline|priority|due|complete|pending|progress)\b/i,
    /\b(create|add|make|new|schedule|plan)\b/i,
    /\b(update|change|modify|edit|set|mark)\b/i,
    /\b(delete|remove|cancel|clear)\b/i,
    /\b(list|show|get|find|search|fetch|view)\b/i,
    /\b(high|medium|low|urgent|important)\b/i,
    /\b(today|tomorrow|this week|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
];

// Sensitive data patterns to redact in output
const SENSITIVE_PATTERNS = [
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: "[EMAIL REDACTED]" },
    { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: "[PHONE REDACTED]" },
    { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: "[CARD REDACTED]" },
    { pattern: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, replacement: "[SSN REDACTED]" },
];

export interface GuardrailResult {
    passed: boolean;
    message: string;
    sanitizedInput?: string;
}

/**
 * Validate user input before sending to AI agent
 */
export function validateInput(input: string): GuardrailResult {
    // Check length
    if (!input || input.trim().length === 0) {
        return { passed: false, message: "Please enter a message." };
    }

    if (input.length > 1000) {
        return { passed: false, message: "Message is too long. Please keep it under 1000 characters." };
    }

    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(input)) {
            console.warn(`[GUARDRAIL] Blocked dangerous input pattern: ${pattern}`);
            return { passed: false, message: "Your request contains invalid characters or patterns." };
        }
    }

    // Check for off-topic requests
    let isOffTopic = false;
    for (const pattern of OFF_TOPIC_PATTERNS) {
        if (pattern.test(input)) {
            isOffTopic = true;
            break;
        }
    }

    // If potentially off-topic, check if it also contains task keywords
    if (isOffTopic) {
        let hasTaskKeyword = false;
        for (const pattern of TASK_RELATED_KEYWORDS) {
            if (pattern.test(input)) {
                hasTaskKeyword = true;
                break;
            }
        }

        if (!hasTaskKeyword) {
            return {
                passed: false,
                message: "I can only help with task management. Try asking me to create, update, or find tasks."
            };
        }
    }

    return { passed: true, message: "Input validated", sanitizedInput: input.trim() };
}

/**
 * Sanitize AI output before sending to user
 */
export function sanitizeOutput(output: string): string {
    if (!output) return output;

    let sanitized = output;

    // Redact sensitive data patterns
    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
        sanitized = sanitized.replace(pattern, replacement);
    }

    // Remove any HTML/script tags that might have been generated
    sanitized = sanitized.replace(/<[^>]*>/g, "");

    return sanitized;
}

/**
 * Check if the response seems valid and task-related
 */
export function validateOutput(output: string): GuardrailResult {
    if (!output || output.trim().length === 0) {
        return { passed: false, message: "No response generated." };
    }

    // Check for error-like responses that indicate the AI might be hallucinating
    const errorPatterns = [
        /I cannot|I'm unable to|I don't have access/i,
        /as an AI|as a language model/i,
    ];

    for (const pattern of errorPatterns) {
        if (pattern.test(output)) {
            // Allow these through but log them
            console.log(`[GUARDRAIL] AI disclaimer detected in output`);
        }
    }

    return { passed: true, message: "Output validated" };
}

/**
 * Combined guardrail check for input
 */
export function applyInputGuardrails(input: string): GuardrailResult {
    const validation = validateInput(input);
    if (!validation.passed) {
        return validation;
    }

    return {
        passed: true,
        message: "All guardrails passed",
        sanitizedInput: validation.sanitizedInput,
    };
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
