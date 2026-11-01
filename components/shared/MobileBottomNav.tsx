"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import AddTaskModal from "../tasks/AddTaskModal";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard" || pathname === "/",
    },
    {
      label: "Tasks",
      path: "/task-ai",
      icon: CheckSquare,
      isActive: pathname === "/task-ai",
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border/80 pb-[env(safe-area-inset-bottom)] select-none shadow-lg"
    >
      <div className="flex h-14 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-1 flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-[11px] font-medium transition-colors touch-manipulation",
                item.isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={cn("size-5 transition-transform", item.isActive && "scale-110 text-primary")} />
              </div>
              <span className="mt-1 leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* Center Quick Add Task Action */}
        <div className="flex items-center justify-center px-1">
          <AddTaskModal
            variant="default"
            className="size-10 rounded-full p-0 flex items-center justify-center shadow-md bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform [&_svg]:mr-0"
          />
        </div>

        {/* Settings Tab */}
        <Link
          href="/settings"
          className={cn(
            "flex flex-1 flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-[11px] font-medium transition-colors touch-manipulation",
            pathname === "/settings"
              ? "text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="relative flex items-center justify-center">
            <Settings className={cn("size-5 transition-transform", pathname === "/settings" && "scale-110 text-primary")} />
          </div>
          <span className="mt-1 leading-none">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
