"use client"
import React from 'react'
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,      // 5 minutes - data considered fresh
            gcTime: 10 * 60 * 1000,        // 10 minutes - cache retention
            refetchOnWindowFocus: false,   // Prevent aggressive refetching
            retry: 1,                       // Single retry on failure
        },
    },
});

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

export default QueryProvider