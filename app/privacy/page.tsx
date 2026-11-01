import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - NeuraTask",
  description: "Privacy Policy and data governance for NeuraTask AI Task Manager",
};

export default function PrivacyPage() {
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
            <h1 className="text-lg font-semibold tracking-tight">NeuraTask Privacy Policy</h1>
            <p className="text-xs text-muted-foreground">Effective Date: November 2026</p>
          </div>
        </header>

        <section className="space-y-4 text-xs text-muted-foreground leading-relaxed">
          <h2 className="text-sm font-medium text-foreground">1. Information We Collect</h2>
          <p>
            NeuraTask collects only the information necessary to provide AI-assisted task management: your account credentials (email address and encrypted password or Google OAuth profile identifier), task items you create, and device Web Push subscription endpoints if you opt-in to notifications.
          </p>

          <h2 className="text-sm font-medium text-foreground">2. AI Processing & Privacy</h2>
          <p>
            When you interact with the NeuraTask AI assistant, task details are processed with strict tenant isolation. Your private task data is never used to train generalized foundation models or shared with third parties.
          </p>

          <h2 className="text-sm font-medium text-foreground">3. Web Push Notifications</h2>
          <p>
            If you enable Web Push notifications, encrypted push messages are routed through standard operating system notification channels (Google FCM, Apple APNs, or Mozilla WebPush). Notification content may be viewed locally or masked in Privacy Mode via your Settings.
          </p>

          <h2 className="text-sm font-medium text-foreground">4. Account Deletion & Rights</h2>
          <p>
            You can delete your account and all associated tasks, chat history, and push subscriptions at any time through your settings or by contacting support.
          </p>
        </section>

        <footer className="pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors underline underline-offset-4">
            Terms of Service
          </Link>
          <span className="font-mono text-[11px]">NeuraTask Security</span>
        </footer>
      </main>
    </div>
  );
}
