"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
}

export default function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const PULL_THRESHOLD = 64;

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-down if we are scrolled to the top
    if (window.scrollY <= 0 && !isRefreshing) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0 && window.scrollY <= 0) {
      // Apply elastic resistance
      const distance = Math.min(diff * 0.45, 90);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current || isRefreshing) return;
    isPulling.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD * 0.7);

      try {
        if (onRefresh) {
          await onRefresh();
        } else {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["tasks"] }),
            queryClient.invalidateQueries({ queryKey: ["calendar"] }),
            queryClient.invalidateQueries({ queryKey: ["messages"] }),
          ]);
          router.refresh();
        }
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-full"
    >
      {/* Pull down indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          style={{ height: `${pullDistance}px` }}
          className="overflow-hidden flex items-center justify-center transition-all duration-150 text-muted-foreground"
        >
          <div className="flex items-center gap-2 text-xs font-medium py-1 px-3 rounded-full bg-muted/80 backdrop-blur shadow-xs border border-border/60">
            <Loader2
              className={`size-3.5 ${
                isRefreshing || pullDistance >= PULL_THRESHOLD ? "animate-spin text-primary" : ""
              }`}
            />
            <span>
              {isRefreshing
                ? "Refreshing..."
                : pullDistance >= PULL_THRESHOLD
                ? "Release to refresh"
                : "Pull down to refresh"}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
