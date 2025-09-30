import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get JWT token using NextAuth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Rule 1: redirect "/" → "/dashboard"
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Rule 3: signed in → block auth routes
  if (token) {
    if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
      return NextResponse.redirect(new URL("/task-ai", req.url));
    }
  }

  return NextResponse.next();
}
