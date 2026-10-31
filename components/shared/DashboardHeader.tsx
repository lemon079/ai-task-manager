"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  ChevronRight,
  Menu,
  PlusCircle,
  LayoutDashboard,
  ListTodo,
  Settings,
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
  "/task-ai": { title: "Tasks AI", icon: ListTodo },
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
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/80 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Drawer Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile Drawer */}
          <div className="flex md:hidden">
            <Drawer open={effectiveOpen} onOpenChange={setOpen} direction="left">
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="!w-fit p-0 border-r border-border">
                <VisuallyHidden>
                  <DrawerTitle>Mobile Navigation Menu</DrawerTitle>
                </VisuallyHidden>
                <Sidebar onLinkClick={() => setOpen(false)} />
              </DrawerContent>
            </Drawer>
          </div>

          {/* Desktop Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              NeuraTask
            </Link>
            <ChevronRight className="hidden sm:inline-block size-3.5 text-muted-foreground/60" />
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <CurrentIcon className="size-4 text-primary" />
                {currentRoute.title}
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI Online
              </span>
            </div>
          </nav>
        </div>

        {/* Right: Quick Action & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          <Link href="/task-ai">
            <Button
              size="sm"
              className="h-9 px-3.5 rounded-xl font-medium gap-1.5 shadow-sm shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-95"
            >
              <Sparkles className="size-3.5" />
              <span className="hidden xs:inline sm:inline">Ask AI</span>
            </Button>
          </Link>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
