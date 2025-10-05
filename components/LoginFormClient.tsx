// app/(auth)/signin/LoginFormClient.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginFormClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.querySelector("#email") as HTMLInputElement)?.value;
    const password = (form.querySelector("#password") as HTMLInputElement)?.value;

    // Authenticate using your credentials provider (NextAuth or custom API)
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      console.error("❌ Login failed:", res.error);
    } else {
      console.log("✅ Logged in successfully");
      // Optionally redirect
      window.location.href = "/dashboard";
    }

    setLoading(false);
  }

  async function handleGoogleClick() {
    await signIn("google");
  }

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-google]")) handleGoogleClick();
      }}
    >
      {children}
    </form>
  );
}
