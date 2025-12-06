"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * React Error Boundary component for graceful error handling
 * Catches rendering errors and displays a user-friendly error message
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error for debugging
        console.error("ErrorBoundary caught an error:", error, errorInfo);

        // Call optional error handler
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                        <AlertTriangle className="size-8 text-destructive" />
                    </div>

                    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>

                    <p className="text-muted-foreground mb-6 max-w-md">
                        We encountered an unexpected error. Please try again or contact support if the problem persists.
                    </p>

                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <details className="mb-6 w-full max-w-lg text-left">
                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                View error details
                            </summary>
                            <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                                {this.state.error.message}
                                {"\n\n"}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}

                    <Button onClick={this.handleRetry} variant="outline">
                        <RefreshCw className="size-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * HOC to wrap components with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}
