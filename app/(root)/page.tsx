import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    title: "Dashboard",
    description: "Task statistics, upcoming schedule, and status overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    description: "Conversational task scheduling and natural language actions",
    href: "/task-ai",
    icon: CheckSquare,
  },
  {
    title: "Settings",
    description: "Notification preferences, timezones, and dark mode",
    href: "/settings",
    icon: Settings,
  },
];

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:py-16">
      {/* Hero Section */}
      <div className="mb-10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          <Sparkles className="size-3 text-primary" />
          <span>NeuraTask v1.2</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Intelligent task management
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
          A minimal workspace for scheduling and tracking your daily goals.
          Manage tasks manually or automate them with natural language.
        </p>

        <div className="pt-2 flex items-center gap-2">
          <Link href="/dashboard">
            <Button
              size="sm"
              className="h-8 px-3 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Open Dashboard
            </Button>
          </Link>
          <Link href="/task-ai">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 rounded-md text-xs font-medium border-border hover:bg-muted/50"
            >
              Start Chatting
            </Button>
          </Link>
        </div>
      </div>

      {/* Flat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="group">
              <div className="h-full rounded-md border border-border bg-card p-3.5 hover:bg-muted/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <ArrowRight className="size-3 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h2 className="text-xs font-semibold text-foreground">
                  {action.title}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
