"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Download,
  Share,
  PlusSquare,
  Copy,
  Check,
  Compass,
  Laptop,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectBrowserPlatform, PlatformDetails } from "@/lib/pwa/display-mode";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<PlatformDetails>({
    isInAppBrowser: false,
    isIos: false,
    isMacSafari: false,
    isChromeOrEdge: true,
    isFirefox: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect browser platform for tailored instructions
    const detected = detectBrowserPlatform();
    setPlatform(detected);

    // Listen for Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin).then(() => {
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background text-foreground flex flex-col justify-between px-4 py-8 sm:py-12 selection:bg-primary/20">
      {/* Top spacer */}
      <div />

      {/* Main Install Card */}
      <main className="w-full max-w-md mx-auto my-auto">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm text-center space-y-6">
          {/* Logo & Brand Icon */}
          <div className="flex justify-center">
            <div className="size-16 sm:size-20 rounded-2xl overflow-hidden border border-border/70 shadow-sm bg-muted/30 p-0.5">
              <Image
                src="/icons/icon-192x192.png"
                alt="NeuraTask Icon"
                width={80}
                height={80}
                priority
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
          </div>

          {/* Core App Messaging */}
          <div className="space-y-2">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              NeuraTask is an app. Kindly install it to continue.
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Install it on your phone or computer to use it.
            </p>
          </div>

          {/* Conditional Instructions by Platform */}
          <div className="pt-2">
            {isInstalled ? (
              /* Already Installed Confirmation */
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center justify-center gap-2.5">
                <CheckCircle2 className="size-4 shrink-0" />
                <span className="font-medium">
                  Installed. Open NeuraTask from your home screen or apps.
                </span>
              </div>
            ) : platform.isInAppBrowser ? (
              /* In-App Browser Guidance (Instagram, TikTok, FB, LinkedIn) */
              <div className="space-y-3.5 p-4 rounded-lg bg-muted/40 border border-border/60 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <ExternalLink className="size-4 text-primary shrink-0" />
                  <span>Open in external browser</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You are viewing this inside an in-app browser. Open this page in Safari or Chrome to install NeuraTask on your device.
                </p>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs gap-1.5 border-border"
                >
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  <span>{copied ? "Link copied" : "Copy link"}</span>
                </Button>
              </div>
            ) : platform.isIos ? (
              /* iOS Safari / iOS Browsers */
              <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border/60 text-left text-xs text-muted-foreground">
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  <Compass className="size-3.5 text-primary" /> Install on iPhone or iPad:
                </p>
                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                      1
                    </span>
                    <span>
                      Tap the <Share className="inline size-3.5 text-primary align-text-bottom mx-0.5" /> <strong className="text-foreground font-medium">Share</strong> button in Safari&apos;s toolbar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                      2
                    </span>
                    <span>
                      Scroll down and select <PlusSquare className="inline size-3.5 text-primary align-text-bottom mx-0.5" /> <strong className="text-foreground font-medium">Add to Home Screen</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                      3
                    </span>
                    <span>
                      Open the <strong className="text-foreground font-medium">NeuraTask</strong> icon from your Home Screen.
                    </span>
                  </div>
                </div>
              </div>
            ) : platform.isMacSafari ? (
              /* macOS Safari (Add to Dock) */
              <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border/60 text-left text-xs text-muted-foreground">
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  <Laptop className="size-3.5 text-primary" /> Install on Mac (Safari):
                </p>
                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                      1
                    </span>
                    <span>
                      Click <strong className="text-foreground font-medium">File</strong> in the top Safari menu bar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                      2
                    </span>
                    <span>
                      Select <strong className="text-foreground font-medium">Add to Dock...</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                      3
                    </span>
                    <span>
                      Launch <strong className="text-foreground font-medium">NeuraTask</strong> directly from your Mac Dock.
                    </span>
                  </div>
                </div>
              </div>
            ) : platform.isFirefox ? (
              /* Firefox / Non-PWA Browser */
              <div className="space-y-3.5 p-4 rounded-lg bg-muted/40 border border-border/60 text-left">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Firefox does not support desktop PWA installation. Open this link in Chrome, Edge, or on your phone to install NeuraTask.
                </p>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs gap-1.5 border-border"
                >
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  <span>{copied ? "Link copied" : "Copy link"}</span>
                </Button>
              </div>
            ) : (
              /* Chrome / Edge / Android Install Prompt */
              <div className="space-y-3">
                <Button
                  onClick={handleInstallClick}
                  disabled={!deferredPrompt}
                  className="w-full h-10 text-xs sm:text-sm font-medium gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  <Download className="size-4" />
                  <span>{deferredPrompt ? "Install app" : "Install from browser menu"}</span>
                </Button>
                {!deferredPrompt && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Click the install icon in your address bar or browser menu (⋮) to install NeuraTask.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Secondary reassurance text */}
          <p className="text-[11px] text-muted-foreground pt-1">
            Already installed? Open NeuraTask from your home screen or app launcher.
          </p>
        </div>
      </main>

      {/* Footer with legal links */}
      <footer className="text-center text-[11px] text-muted-foreground space-x-4 pt-6">
        <a href="/privacy" className="hover:text-foreground transition-colors underline underline-offset-4">
          Privacy Policy
        </a>
        <span>·</span>
        <a href="/terms" className="hover:text-foreground transition-colors underline underline-offset-4">
          Terms of Service
        </a>
      </footer>
    </div>
  );
}
