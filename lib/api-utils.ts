import { NextResponse } from "next/server";

/**
 * Standardized API response interface
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}

/**
 * Create a successful API response
 */
export function successResponse<T>(
    data: T,
    message?: string,
    meta?: ApiResponse["meta"]
): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
            message,
            meta,
        },
        { status: 200 }
    );
}

/**
 * Create an error API response
 */
export function errorResponse(
    error: string,
    status: number = 400
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            error,
        },
        { status }
    );
}

/**
 * Common error responses
 */
export const ApiErrors = {
    unauthorized: () => errorResponse("Unauthorized", 401),
    forbidden: () => errorResponse("Forbidden", 403),
    notFound: (resource = "Resource") => errorResponse(`${resource} not found`, 404),
    badRequest: (message = "Bad request") => errorResponse(message, 400),
    internalError: () => errorResponse("Internal server error", 500),
    rateLimited: (retryAfter?: number) =>
        NextResponse.json(
            {
                success: false,
                error: "Rate limit exceeded. Please try again later.",
                retryAfter,
            },
            { status: 429 }
        ),
} as const;

/**
 * Wrapper for async API handlers with automatic error handling
 */
export function withErrorHandler<T>(
    handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
    return handler().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("API Error:", message);
        return ApiErrors.internalError() as NextResponse<ApiResponse<T>>;
    });
}

/**
 * Validate that required fields exist in request body
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
    body: T,
    requiredFields: (keyof T)[]
): { valid: true } | { valid: false; missing: string[] } {
    const missing = requiredFields.filter(
        (field) => body[field] === undefined || body[field] === null
    );

    if (missing.length > 0) {
        return { valid: false, missing: missing as string[] };
    }

    return { valid: true };
}
