"use client";

import Link from "next/link";
import { WifiOff, RotateCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <WifiOff className="size-6 text-muted-foreground" />
        </div>

        <h1 className="text-base font-semibold text-foreground tracking-tight mb-1.5">
          You are currently offline
        </h1>

        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
          NeuraTask couldn&apos;t reach the network. Your cached workspace is intact, and updates will sync automatically once connectivity is restored.
        </p>

        <div className="flex flex-col gap-2.5">
          <Button
            onClick={handleRetry}
            className="w-full h-8 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RotateCw className="mr-1.5 size-3.5" />
            Retry connection
          </Button>

          <Button
            variant="outline"
            asChild
            className="w-full h-8 text-xs font-medium border-border text-foreground hover:bg-muted/50"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-1.5 size-3.5 text-muted-foreground" />
              Return to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
