import { getTasks } from "@/lib/actions/task";
import StatCard from "@/components/dashboard/StatCard";
import { ListTodo, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { ScheduleCalendar } from "@/components/calender/Calendar";
import TaskTable from "@/components/tasks/TaskTable";

export default async function DashboardPage() {
  const tasks = await getTasks();

  // Calculate stats
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in_progress").length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const overdueTasks = tasks.filter(t => t.status === "over_due").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your tasks and schedule</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon={ListTodo}
          description="All time"
        />
        <StatCard
          title="Pending"
          value={pendingTasks}
          icon={Clock}
          description="In progress"
          className="border-l-4 border-l-amber-500"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle2}
          description="Well done!"
          className="border-l-4 border-l-green-500"
        />
        <StatCard
          title="Overdue"
          value={overdueTasks}
          icon={AlertCircle}
          description="Needs attention"
          className="border-l-4 border-l-red-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming Schedule - Calendar */}
        <div className="xl:col-span-2 bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Schedule</h2>
          <ScheduleCalendar tasks={tasks} />
        </div>

        {/* Recent Tasks */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`size-2 rounded-full ${task.status === "completed" ? "bg-green-500" :
                  task.status === "over_due" ? "bg-red-500" :
                    task.status === "in_progress" ? "bg-amber-500" :
                      "bg-slate-400"
                  }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{task.priority} priority</p>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">All Tasks</h2>
        </div>
        <TaskTable tasks={tasks} />
      </div>
    </div>
  );
}
