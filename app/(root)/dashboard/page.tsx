import { getTasks } from "@/lib/actions/task";
import StatCard from "@/components/dashboard/StatCard";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CalendarDays,
  Activity,
} from "lucide-react";
import { ScheduleCalendar } from "@/components/calender/Calendar";
import TaskTable from "@/components/tasks/TaskTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const tasks = await getTasks();

  // Calculate statistics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "in_progress"
  ).length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const overdueTasks = tasks.filter((t) => t.status === "over_due").length;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-3" />
              AI Assistant
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time schedule intelligence, active goals, and pending deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completion Rate
            </span>
            <span className="text-sm font-bold text-foreground">
              {completionRate}% ({completedTasks}/{totalTasks})
            </span>
          </div>
          <Link href="/task-ai">
            <Button className="h-10 px-4 rounded-xl font-medium gap-2 shadow-sm shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-95">
              <Sparkles className="size-4" />
              <span>New Task with AI</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon={ListTodo}
          description="Lifetime scheduled"
          variant="indigo"
        />
        <StatCard
          title="In Progress"
          value={pendingTasks}
          icon={Clock}
          description="Awaiting completion"
          variant="amber"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle2}
          description={`${completionRate}% completion rate`}
          variant="emerald"
        />
        <StatCard
          title="Overdue"
          value={overdueTasks}
          icon={AlertCircle}
          description={overdueTasks > 0 ? "Requires attention" : "All on track"}
          variant="rose"
        />
      </div>

      {/* Main Content Grid: Calendar + Recent Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming Schedule - Calendar */}
        <div className="xl:col-span-2 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-5 sm:p-6 shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CalendarDays className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Upcoming Schedule
                </h2>
                <p className="text-xs text-muted-foreground">
                  Click any calendar date to view scheduled tasks
                </p>
              </div>
            </div>
          </div>
          <ScheduleCalendar tasks={tasks} />
        </div>

        {/* Recent Tasks Feed */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-5 sm:p-6 shadow-xs hover:border-border transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Activity className="size-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                Recent Tasks
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
              {tasks.length} total
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {tasks.slice(0, 5).map((task) => {
              const isDone = task.status === "completed";
              const isOverdue = task.status === "over_due";
              const isPending = task.status === "in_progress" || task.status === "pending";

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/40 transition-colors"
                >
                  <div
                    className={`size-2.5 rounded-full shrink-0 ${
                      isDone
                        ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                        : isOverdue
                        ? "bg-rose-500 shadow-xs shadow-rose-500/50"
                        : isPending
                        ? "bg-amber-500 shadow-xs shadow-amber-500/50"
                        : "bg-slate-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isDone
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-muted-foreground capitalize">
                        {task.priority} priority
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-[11px] text-muted-foreground capitalize">
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2">
                  <ListTodo className="size-6" />
                </div>
                <p className="text-sm font-medium text-foreground">No tasks yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Use the AI Assistant to schedule your first task.
                </p>
                <Link href="/task-ai" className="mt-3">
                  <Button variant="outline" size="sm" className="rounded-lg text-xs">
                    Ask AI to create
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Table Section */}
      <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-5 sm:p-6 shadow-xs hover:border-border transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              All Tasks
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage status, priority, and due dates across all tasks
            </p>
          </div>
          <Link href="/task-ai">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Sparkles className="size-3.5" />
              Manage via AI Chat
            </Button>
          </Link>
        </div>

        <TaskTable tasks={tasks} isDashboard />
      </div>
    </div>
  );
}
