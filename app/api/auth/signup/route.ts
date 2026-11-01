import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/prisma/prisma";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    // Rate limit signup attempts by client IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rateLimitResult = checkRateLimit(`signup:${ip}`, RATE_LIMITS.AUTH);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, password } = await req.json();

    // Validate email
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Validate password complexity
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const SALT_ROUNDS = process.env.NODE_ENV === "production" ? 10 : 4;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    await prisma.user.create({
      data: {
        name: name ? String(name).trim() : null,
        email: email.toLowerCase().trim(),
        hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
