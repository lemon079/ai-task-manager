"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Menu,
  LayoutDashboard,
  CheckSquare,
  Settings,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Sidebar from "./Sidebar";
import useMedia from "use-media";

const routeNames: Record<string, { title: string; icon: React.ElementType }> = {
  "/dashboard": { title: "Dashboard", icon: LayoutDashboard },
  "/task-ai": { title: "Tasks", icon: CheckSquare },
  "/settings": { title: "Settings", icon: Settings },
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isLargeScreen = useMedia({ minWidth: "768px" });
  const effectiveOpen = isLargeScreen ? false : open;

  const currentRoute = routeNames[pathname] || {
    title: pathname === "/" ? "Overview" : "Workspace",
    icon: LayoutDashboard,
  };
  const CurrentIcon = currentRoute.icon;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background select-none">
      <div className="flex h-11 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Drawer Trigger + Breadcrumb */}
        <div className="flex items-center gap-2">
          {/* Mobile Drawer */}
          <div className="flex md:hidden">
            <Drawer open={effectiveOpen} onOpenChange={setOpen} direction="left">
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 sm:size-7 rounded-md text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="!w-fit p-0 border-r border-border bg-sidebar">
                <VisuallyHidden>
                  <DrawerTitle>Navigation</DrawerTitle>
                </VisuallyHidden>
                <Sidebar onLinkClick={() => setOpen(false)} />
              </DrawerContent>
            </Drawer>
          </div>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors font-normal"
            >
              NeuraTask
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CurrentIcon className="size-3.5 text-muted-foreground" />
              {currentRoute.title}
            </span>
          </nav>
        </div>

        {/* Right: Quick Action & Theme Switcher */}
        <div className="flex items-center gap-2">
          {pathname !== "/task-ai" && (
            <Link href="/task-ai">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 rounded-md text-xs font-normal gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border"
              >
                <Sparkles className="size-3 text-primary" />
                <span className="hidden sm:inline">Ask AI</span>
              </Button>
            </Link>
          )}
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
