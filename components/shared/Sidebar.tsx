"use client";

import Link from "next/link";
import { LayoutDashboard, ListTodo, Settings, LogOut, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
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
      badge: null,
    },
    {
      label: "Tasks AI",
      path: "/task-ai",
      icon: ListTodo,
      badge: "AI",
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  async function handleSignOut() {
    await signOut({ redirect: true, callbackUrl: "/signin" });
  }

  const userInitial = session?.user?.name?.[0]?.toUpperCase() ||
    session?.user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <aside className="w-64 flex flex-col border-r border-border/60 bg-sidebar/95 backdrop-blur-md sticky top-0 left-0 h-screen transition-colors">
      {/* Brand Header */}
      <div className="p-5 pb-4">
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1 -m-1 transition-transform active:scale-[0.98]"
          onClick={onLinkClick}
        >
          <div className="size-10 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20 ring-1 ring-primary/30 group-hover:shadow-primary/40 transition-shadow">
            <Sparkles className="size-5 text-primary-foreground transition-transform group-hover:rotate-12 duration-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-foreground">
                NeuraTask
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                AI
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Task Automation
            </span>
          </div>
        </Link>
      </div>

      <div className="px-5">
        <Separator className="bg-border/60" />
      </div>

      {/* Navigation Links */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
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
                className="group relative"
              >
                <div
                  className={cn(
                    "flex items-center justify-between w-full h-11 px-3.5 rounded-xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:translate-x-0.5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "size-4.5 transition-colors",
                        active
                          ? "text-primary dark:text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Left Active Accent Pill */}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="px-5">
        <Separator className="bg-border/60" />
      </div>

      {/* Footer Profile & Actions */}
      <div className="p-3.5 space-y-2">
        {/* User Card with Embedded ThemeToggle */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card/60 border border-border/50">
          <div className="flex items-center gap-2.5 min-w-0">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || "User Avatar"}
                className="size-8 rounded-lg object-cover ring-1 ring-border"
              />
            ) : (
              <div className="size-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userInitial}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate leading-tight">
                {session?.user?.name || "Neura User"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate leading-tight">
                {session?.user?.email || "user@neuratask.app"}
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Sign Out Action */}
        <Button
          variant="ghost"
          size="sm"
          className="justify-start w-full h-9 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={async () => {
            onLinkClick?.();
            await handleSignOut();
          }}
        >
          <LogOut className="size-3.5 mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
