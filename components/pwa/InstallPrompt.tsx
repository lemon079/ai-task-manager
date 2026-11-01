"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Download, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // 1. If already installed in standalone mode, never show prompt
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // 2. Check if user dismissed recently (14 days cooldown)
    const dismissedTime = localStorage.getItem("neuratask-pwa-dismissed");
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 14) return;
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice && isSafari) {
      setIsIos(true);
      // Delay showing so user can experience app first
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }

    // 4. Chrome / Edge / Android `beforeinstallprompt`
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait 3 seconds to avoid popping up instantly
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("neuratask-pwa-dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <aside
      aria-label="Install App"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 select-none"
    >
      <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-md p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg overflow-hidden shrink-0 border border-border/50 bg-muted/40">
              <Image
                src="/icons/icon-192x192.png"
                alt="NeuraTask Icon"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Install NeuraTask
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fast offline access & AI productivity on your device
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="size-7 rounded-md text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Dismiss install prompt"
          >
            <X className="size-4" />
          </button>
        </div>

        {isIos ? (
          <div className="mt-3 text-xs text-muted-foreground border-t border-border/50 pt-2.5 space-y-1.5">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              Install on iOS Safari:
            </p>
            <p className="flex items-center gap-1.5">
              1. Tap the <Share className="size-3.5 text-primary shrink-0" /> <span className="font-medium text-foreground">Share</span> button below
            </p>
            <p className="flex items-center gap-1.5">
              2. Scroll down & select <PlusSquare className="size-3.5 text-primary shrink-0" /> <span className="font-medium text-foreground">Add to Home Screen</span>
            </p>
            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={handleDismiss} className="h-7 text-xs">
                Got it
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/50 pt-2.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Not now
            </Button>
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="h-8 text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              <Download className="size-3.5" />
              Install
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
