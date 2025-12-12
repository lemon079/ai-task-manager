import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Workflow, Settings, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    title: "Dashboard",
    description: "View your tasks and calendar at a glance",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Task AI",
    description: "Chat with AI to manage your tasks naturally",
    href: "/task-ai",
    icon: Workflow,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Settings",
    description: "Configure notifications and preferences",
    href: "/settings",
    icon: Settings,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
          <Sparkles className="size-4" />
          <span className="text-sm font-medium">AI-Powered Task Management</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Welcome to <span className="text-gradient">NeuraTask</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Manage your tasks effortlessly using natural language. Create, update, and organize
          tasks just by chatting with your AI assistant.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 h-full">
              <CardHeader>
                <div className={`size-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-2`}>
                  <action.icon className={`size-6 ${action.color}`} />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {action.title}
                  <ArrowRight className="size-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10">
        <Link href="/task-ai">
          <Button size="lg" className="gap-2">
            <Workflow className="size-5" />
            Start Chatting with AI
          </Button>
        </Link>
      </div>
    </div>
  );
}

