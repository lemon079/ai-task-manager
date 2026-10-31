import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Workflow,
  Settings,
  ArrowRight,
  Sparkles,
  Bot,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    title: "Dashboard",
    description: "Real-time task analytics, calendar timeline, and instant status tracking",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: "Analytics",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10 dark:bg-indigo-500/20",
    borderColor: "hover:border-indigo-500/40",
  },
  {
    title: "Tasks AI",
    description: "Conversational task scheduling, natural language updates, and AI reasoning",
    href: "/task-ai",
    icon: Workflow,
    badge: "Assistant",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
    borderColor: "hover:border-purple-500/40",
  },
  {
    title: "Settings",
    description: "Manage system preferences, calendar integration, and account profile",
    href: "/settings",
    icon: Settings,
    badge: "Config",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-500/10 dark:bg-slate-500/20",
    borderColor: "hover:border-slate-500/40",
  },
];

const highlights = [
  {
    icon: Bot,
    title: "Autonomous Agents",
    desc: "Natural language parsing into structured task items",
  },
  {
    icon: CalendarCheck,
    title: "Smart Scheduling",
    desc: "Automatic deadline prioritization and calendar sync",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Ready",
    desc: "Secure OAuth, PostgreSQL & vector search embeddings",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-10 px-4">
      {/* Ambient Gradient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-tr from-primary/15 via-indigo-500/10 to-purple-500/15 blur-3xl rounded-full -z-10 opacity-70"
      />

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 text-xs font-semibold backdrop-blur-sm">
          <Sparkles className="size-3.5 animate-pulse" />
          <span>Next-Generation AI Task Management</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 text-foreground">
          Command your workflow with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-purple-500">
            NeuraTask
          </span>
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Manage your schedule effortlessly using natural language. Create, prioritize, and
          automate your daily goals through an intelligent conversational companion.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/task-ai">
            <Button
              size="lg"
              className="h-11 px-6 rounded-xl font-medium gap-2 shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-95"
            >
              <Workflow className="size-4" />
              <span>Launch AI Workspace</span>
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 rounded-xl font-medium gap-2 hover:bg-muted/80 transition-colors"
            >
              <LayoutDashboard className="size-4 text-muted-foreground" />
              <span>View Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="group">
            <div
              className={`h-full rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-card ${action.borderColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`size-12 rounded-xl ${action.bgColor} flex items-center justify-center transition-transform group-hover:scale-105`}
                >
                  <action.icon className={`size-6 ${action.color}`} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {action.badge}
                </span>
              </div>

              <h2 className="text-lg font-bold text-foreground flex items-center justify-between">
                <span>{action.title}</span>
                <ArrowRight className="size-4 text-muted-foreground -translate-x-1 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
              </h2>

              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Feature Highlights Banner */}
      <div className="mt-14 w-full max-w-5xl border-t border-border/50 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          {highlights.map((h, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <h.icon className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{h.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
