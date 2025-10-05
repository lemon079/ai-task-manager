import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/task-ai","journals", "/settings"]; // Add all routes you want protected

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get JWT token using NextAuth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // Rule 1: redirect "/" → "/dashboard"
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Rule 2: redirect signed-in users away from auth pages
  if (
    token &&
    (pathname.startsWith("/signin") || pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/task-ai", req.url));
  }

  // Rule 3: protect routes for non-signed-in users
  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to these routes
export const config = {
  matcher: ["/", "/dashboard/:path*", "/task-ai/:path*", "/journals/:path*" ,"/settings/:path*", "/signin", "/signup"],
};
