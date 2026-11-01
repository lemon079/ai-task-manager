"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { InstallPrompt } from "./InstallPrompt";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const prevStatus = useRef(status);

  // 1. Service Worker Registration & Non-blocking Update Notification
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Only enable service worker in production to prevent stale cache in development
    const isProduction = process.env.NODE_ENV === "production";
    const forceEnable = window.location.search.includes("pwa=true");

    if (!isProduction && !forceEnable) {
      // In dev mode, ensure any existing service workers are unregistered
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      return;
    }

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        // Listen for new service worker installing
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Check if user is actively typing in chat or input
              const isUserTyping =
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA";

              const showUpdateToast = () => {
                toast("Update available", {
                  description: "A new version of NeuraTask is ready.",
                  duration: Infinity,
                  action: {
                    label: "Refresh",
                    onClick: () => {
                      newWorker.postMessage({ type: "SKIP_WAITING" });
                    },
                  },
                });
              };

              if (isUserTyping) {
                // Defer until blur so typing isn't interrupted
                const onBlur = () => {
                  window.removeEventListener("blur", onBlur);
                  showUpdateToast();
                };
                window.addEventListener("blur", onBlur, { once: true });
              } else {
                showUpdateToast();
              }
            }
          });
        });
      })
      .catch((err) => {
        console.warn("[PWA] ServiceWorker registration failed:", err);
      });
  }, []);

  // 2. Sign Out Privacy Guarantee: Clear caches and queries
  useEffect(() => {
    if (prevStatus.current === "authenticated" && status === "unauthenticated") {
      // Discard all in-memory React Query cache
      queryClient.clear();

      // Signal Service Worker to purge all private user caches
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CLEAR_PRIVATE_CACHE",
        });
      }
    }
    prevStatus.current = status;
  }, [status, queryClient]);

  return (
    <>
      {children}
      <InstallPrompt />
    </>
  );
}
