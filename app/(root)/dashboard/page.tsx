import { getTasks } from "@/lib/actions/task";
import StatCard from "@/components/dashboard/StatCard";
import { ScheduleCalendar } from "@/components/calender/Calendar";
import TaskTable from "@/components/tasks/TaskTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const tasks = await getTasks();

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "in_progress"
  ).length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const overdueTasks = tasks.filter((t) => t.status === "over_due").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Overview of your tasks and schedule
          </p>
        </div>

        <Link href="/task-ai">
          <Button
            size="sm"
            className="h-7 px-2.5 rounded-md text-xs font-medium gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="size-3" />
            <span>New Task</span>
          </Button>
        </Link>
      </div>

      {/* Four Quiet Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total"
          value={totalTasks}
          indicator="neutral"
        />
        <StatCard
          title="Pending"
          value={pendingTasks}
          indicator="amber"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          indicator="emerald"
        />
        <StatCard
          title="Overdue"
          value={overdueTasks}
          indicator="rose"
        />
      </div>

      {/* Side-by-Side: Recent Tasks & Upcoming Schedule (Equal Visual Weight) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Tasks */}
        <div className="rounded-md border border-border bg-card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-foreground">
              Recent Tasks
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {tasks.length} total
            </span>
          </div>

          <div className="space-y-1 divide-y divide-border/40 flex-1">
            {tasks.slice(0, 5).map((task) => {
              const isDone = task.status === "completed";
              const isOverdue = task.status === "over_due";
              const isPending = task.status === "in_progress" || task.status === "pending";

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className={`size-1.5 rounded-full shrink-0 ${
                        isDone
                          ? "bg-muted-foreground/40"
                          : isOverdue
                          ? "bg-rose-500"
                          : isPending
                          ? "bg-amber-500"
                          : "bg-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-xs truncate ${
                        isDone
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <span className="text-[11px] text-muted-foreground capitalize shrink-0 tabular-nums">
                    {task.priority}
                  </span>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No tasks yet. Create one with AI to get started.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Schedule (Minimal Calendar) */}
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-foreground">
              Upcoming Schedule
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Calendar
            </span>
          </div>
          <ScheduleCalendar tasks={tasks} />
        </div>
      </div>

      {/* All Tasks Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-foreground">
            All Tasks
          </h2>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </span>
        </div>
        <TaskTable tasks={tasks} isDashboard />
      </div>
    </div>
  );
}
