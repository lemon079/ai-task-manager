"use client";
import Link from "next/link";
import { LayoutDashboard, Workflow, Settings, LogOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import CustomSeparator from "./CustomSeparator";
import IconWrapper from "./IconWrapper";
import { signOut } from "next-auth/react";

export default function Sidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <IconWrapper icon={LayoutDashboard} />,
    },
    {
      label: "Task AI",
      path: "/task-ai",
      icon: <IconWrapper icon={Workflow} />,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <IconWrapper icon={Settings} />,
    },
  ];

  async function handleSignOut() {
    await signOut({ redirect: true, callbackUrl: "/signin" });
  }

  return (
    <aside className="w-64 flex bg-blue-100 flex-col border-r border-blue-200 shadow-xl sticky top-0 left-0 h-screen">
      <div className="p-6 text-xl font-bold text-blue-900">AI Task & Journals</div>
      <CustomSeparator />

      <ScrollArea className="flex-1 p-2">
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} onClick={onLinkClick}>
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start w-full text-blue-900",
                    active
                      ? "bg-customBlue text-white pointer-events-none" // no hover, disabled hover effect
                      : "hover:bg-blue-200"
                  )}
                >
                  <span className="flex items-center gap-x-2">
                    {item.icon} {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}

        </nav>
      </ScrollArea>

      <CustomSeparator />
      <div className="p-4">
        <Button
          variant="ghost"
          className="justify-start w-full text-blue-900 hover:bg-blue-200"
          onClick={async () => {
            onLinkClick?.();
            await handleSignOut();
          }}
        >
          <IconWrapper icon={LogOut} />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
