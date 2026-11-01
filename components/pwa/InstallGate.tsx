"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isStandaloneDisplayMode, DisplayModeState } from "@/lib/pwa/display-mode";
import { InstallPage } from "./InstallPage";
import NextAuthProvider from "@/components/NextAuthProvider";
import QueryProvider from "@/components/QueryProvider";
import { PwaProvider } from "@/components/pwa/PwaProvider";

/**
 * ARCHITECTURE NOTE:
 * The Install Gate is a UX boundary, NOT a security boundary.
 * Every API route maintains its own authentication, CSRF origin verification,
 * and rate limiting. Never rely on the gate for backend data protection.
 *
 * In "checking" and "browser" states, data-fetching providers (NextAuthProvider,
 * QueryProvider, chat, push) are NOT mounted, ensuring a normal browser tab
 * never fires authenticated API requests.
 */

const ALLOW_LISTED_PATHS = ["/offline", "/privacy", "/terms"];

export function InstallGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayState, setDisplayState] = useState<DisplayModeState>("checking");

  // Determine if current route is an allow-listed public page
  const isAllowListed = ALLOW_LISTED_PATHS.some((path) =>
    pathname?.startsWith(path)
  );

  useEffect(() => {
    // Register service worker in browser too so browser triggers beforeinstallprompt
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const isProduction = process.env.NODE_ENV === "production";
      const forceEnable = window.location.search.includes("pwa=true");

      if (isProduction || forceEnable) {
        navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
      }
    }

    // Live display-mode detection
    const updateDisplayMode = () => {
      const isStandalone = isStandaloneDisplayMode();
      setDisplayState(isStandalone ? "standalone" : "browser");
    };

    updateDisplayMode();

    // Listen for live display mode changes (e.g. app installed and launched)
    const mqlStandalone = window.matchMedia("(display-mode: standalone)");
    const mqlFullscreen = window.matchMedia("(display-mode: fullscreen)");
    const mqlMinimal = window.matchMedia("(display-mode: minimal-ui)");

    mqlStandalone.addEventListener("change", updateDisplayMode);
    mqlFullscreen.addEventListener("change", updateDisplayMode);
    mqlMinimal.addEventListener("change", updateDisplayMode);

    return () => {
      mqlStandalone.removeEventListener("change", updateDisplayMode);
      mqlFullscreen.removeEventListener("change", updateDisplayMode);
      mqlMinimal.removeEventListener("change", updateDisplayMode);
    };
  }, []);

  // 1. Allow-listed public pages (e.g. /privacy, /terms, /offline) render immediately
  if (isAllowListed) {
    return <>{children}</>;
  }

  // 2. "checking" state: neutral minimal splash (logo, no app content, no data fetch)
  if (displayState === "checking") {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
          <div className="size-14 rounded-2xl overflow-hidden border border-border/70 shadow-sm bg-muted/40 p-0.5">
            <Image
              src="/icons/icon-192x192.png"
              alt="NeuraTask"
              width={56}
              height={56}
              priority
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <span className="text-xs font-medium tracking-tight text-muted-foreground animate-pulse">
            NeuraTask
          </span>
        </div>
      </div>
    );
  }

  // 3. "browser" state: render the install page only (no data providers mounted)
  if (displayState === "browser") {
    return <InstallPage />;
  }

  // 4. "standalone" state: render full application with session and data providers
  return (
    <NextAuthProvider>
      <QueryProvider>
        <PwaProvider>{children}</PwaProvider>
      </QueryProvider>
    </NextAuthProvider>
  );
}
