/**
 * Structured Logger & Audit Logging Utility
 * Standardizes log formatting, request correlation, error tracking, and task mutation audit trails.
 */

import { redactSensitiveForLogs } from "./langchain/guardrails";

export interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  latencyMs?: number;
  [key: string]: unknown;
}

function formatLog(level: "INFO" | "WARN" | "ERROR", message: string, context?: LogContext): string {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message: redactSensitiveForLogs(message),
    ...(context ? context : {}),
  };

  return JSON.stringify(payload);
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.log(formatLog("INFO", message, context));
  },

  warn(message: string, context?: LogContext) {
    console.warn(formatLog("WARN", message, context));
  },

  error(message: string, error?: unknown, context?: LogContext) {
    const errorDetails = error instanceof Error
      ? { errorMessage: error.message, stack: process.env.NODE_ENV !== "production" ? error.stack : undefined }
      : { errorMessage: String(error) };

    console.error(formatLog("ERROR", message, { ...context, ...errorDetails }));
  },

  /**
   * Audit log for task mutations
   */
  auditMutation(mutation: {
    action: "CREATE" | "UPDATE" | "DELETE";
    taskId: string;
    userId: string;
    title: string;
    changes?: Record<string, unknown>;
    requestId?: string;
  }) {
    console.log(
      JSON.stringify({
        type: "AUDIT_TASK_MUTATION",
        timestamp: new Date().toISOString(),
        ...mutation,
        title: redactSensitiveForLogs(mutation.title),
      })
    );
  },
};
