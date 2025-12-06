import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/task-ai", "/journals", "/settings"];

/**
 * Next.js 16 Proxy - replaces the deprecated middleware.ts
 * Handles route protection and auth redirects
 */
export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Get session using NextAuth v5
    const session = await auth();
    const isAuthenticated = !!session?.user;

    // Rule 1: redirect "/" → "/dashboard"
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Rule 2: redirect signed-in users away from auth pages
    if (
        isAuthenticated &&
        (pathname.startsWith("/signin") || pathname.startsWith("/signup"))
    ) {
        return NextResponse.redirect(new URL("/task-ai", req.url));
    }

    // Rule 3: protect routes for non-signed-in users
    if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    return NextResponse.next();
}

// Apply proxy only to these routes
export const config = {
    matcher: ["/", "/dashboard/:path*", "/task-ai/:path*", "/journals/:path*", "/settings/:path*", "/signin", "/signup"],
};
