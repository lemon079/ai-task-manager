import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - NeuraTask",
  description: "Terms of Service and Usage Agreement for NeuraTask AI Task Manager",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12 flex justify-center">
      <main className="w-full max-w-2xl space-y-8">
        <header className="flex items-center gap-3 border-b border-border pb-5">
          <Image
            src="/icons/icon-192x192.png"
            alt="NeuraTask Logo"
            width={32}
            height={32}
            className="rounded-lg border border-border"
          />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">NeuraTask Terms of Service</h1>
            <p className="text-xs text-muted-foreground">Effective Date: November 2026</p>
          </div>
        </header>

        <section className="space-y-4 text-xs text-muted-foreground leading-relaxed">
          <h2 className="text-sm font-medium text-foreground">1. Acceptance of Terms</h2>
          <p>
            By installing or using NeuraTask, you agree to be bound by these Terms of Service. NeuraTask is an install-only progressive web application engineered for personal and organizational task productivity.
          </p>

          <h2 className="text-sm font-medium text-foreground">2. Permitted Use</h2>
          <p>
            You agree not to misuse the service, inject malicious scripts, attempt unauthorized database access, or reverse-engineer AI agent endpoints. Rate limits are enforced on a per-user basis to ensure high service availability for all members.
          </p>

          <h2 className="text-sm font-medium text-foreground">3. Service Availability</h2>
          <p>
            NeuraTask provides offline caching capabilities for installed applications. While we strive for 99.9% uptime, synchronization with AI services requires active internet connectivity.
          </p>
        </section>

        <footer className="pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors underline underline-offset-4">
            Privacy Policy
          </Link>
          <span className="font-mono text-[11px]">NeuraTask Terms</span>
        </footer>
      </main>
    </div>
  );
}
