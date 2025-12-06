"use client";
import Link from "next/link";
import { LayoutDashboard, ListTodo, Settings, LogOut, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react";

export default function Sidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Tasks",
      path: "/task-ai",
      icon: ListTodo,
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
    <aside className="w-64 flex flex-col border-r border-border bg-sidebar sticky top-0 left-0 h-screen">
      {/* Brand */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3" onClick={onLinkClick}>
          <div className="size-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground">
              NeuraTask
            </span>
            <span className="text-xs text-muted-foreground">Task Manager</span>
          </div>
        </Link>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const active = pathname === item.path || pathname.startsWith(item.path + "/");
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} onClick={onLinkClick}>
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start w-full h-11 px-3 font-medium",
                    active
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="size-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="p-3">
        <Button
          variant="ghost"
          className="justify-start w-full h-11 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={async () => {
            onLinkClick?.();
            await handleSignOut();
          }}
        >
          <LogOut className="size-5 mr-3" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
