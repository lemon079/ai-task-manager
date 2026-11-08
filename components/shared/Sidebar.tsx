"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, CheckSquare, Settings, LogOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export default function Sidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Tasks",
      path: "/task-ai",
      icon: CheckSquare,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  async function handleSignOut() {
    await signOut({ redirect: true, callbackUrl: "/signin" });
  }

  return (
    <aside className="w-56 flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 left-0 select-none">
      {/* Brand Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border/40">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={onLinkClick}
        >
          <div className="size-6 rounded-md overflow-hidden bg-black flex items-center justify-center shrink-0">
            <Image
              src="/icons/icon-192x192.png"
              alt="NeuraTask logo"
              width={24}
              height={24}
              className="size-6 object-cover"
            />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-foreground">
            NeuraTask
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-0.5" aria-label="Main Navigation">
          {menuItems.map((item) => {
            const active =
              pathname === item.path ||
              (item.path !== "/" && pathname.startsWith(item.path + "/"));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors",
                  active
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Footer: User & Sign Out */}
      <div className="p-3 border-t border-border/40 space-y-2">
        {session?.user && (
          <div className="px-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate leading-tight">
              {session.user.name || "User"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
              {session.user.email}
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-7 px-1 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent font-normal cursor-pointer"
          onClick={async () => {
            onLinkClick?.();
            await handleSignOut();
          }}
        >
          <LogOut className="size-3.5 mr-2 text-muted-foreground" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
