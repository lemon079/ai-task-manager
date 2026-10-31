"use client";

import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@prisma/client";
import { cn } from "@/lib/utils";
import TaskTable from "../tasks/TaskTable";
import { ResponsiveDialog } from "../shared/ResponsiveDialog";
import { useModalContext } from "@/hooks/useModalContext";

function formatDateKey(d: Date | string): string {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getUrgencyInfo(dayTasks: Task[], today: Date): {
  color: string;
  ping: boolean;
} {
  if (dayTasks.length === 0) return { color: "bg-transparent", ping: false };

  const nearestDiff = Math.min(
    ...dayTasks.map((task) =>
      task.dueDate
        ? Math.ceil(
            (new Date(task.dueDate).getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : Infinity
    )
  );

  if (nearestDiff < 0) return { color: "bg-rose-500", ping: true }; // overdue
  if (nearestDiff === 0) return { color: "bg-amber-500", ping: true }; // today
  if (nearestDiff <= 3) return { color: "bg-sky-500", ping: false }; // soon
  if (nearestDiff <= 7) return { color: "bg-emerald-500", ping: false }; // next week
  return { color: "bg-slate-400 dark:bg-slate-500", ping: false }; // distant
}

export function ScheduleCalendar({ tasks }: { tasks: Task[] }) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);
  const { setModalOpen } = useModalContext();
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Group tasks by dueDate using normalized date keys
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = formatDateKey(task.dueDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    return map;
  }, [tasks]);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <Calendar
          mode="single"
          className="rounded-xl border border-border/70 shadow-2xs mt-4 size-full bg-card/40"
          components={{
            DayButton: ({ day, ...props }) => {
              const key = formatDateKey(day.date);
              const dayTasks = tasksByDate.get(key) ?? [];
              const { color: urgencyColor, ping } = getUrgencyInfo(dayTasks, today);
              const isTodayCell = key === todayKey;

              return (
                <button
                  {...props}
                  className={cn(
                    "relative flex flex-col items-start justify-start border text-left",
                    "size-full min-h-[76px] sm:min-h-[84px] p-2 transition-all duration-200 cursor-pointer rounded-xl group",
                    dayTasks.length > 0
                      ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
                      : "border-border/50 hover:bg-muted/40",
                    isTodayCell && "ring-1.5 ring-primary/60 font-semibold"
                  )}
                  onClick={() => {
                    if (dayTasks.length === 0) return;
                    setSelectedTasks(dayTasks);
                    setSelectedDate(
                      day.date.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    );
                    setModalOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        "text-xs font-semibold tabular-nums",
                        isTodayCell
                          ? "text-primary font-bold"
                          : "text-foreground group-hover:text-primary transition-colors"
                      )}
                    >
                      {day.date.getDate()}
                    </span>

                    {/* Urgency Badge Indicator */}
                    {dayTasks.length > 0 && (
                      <span className="relative flex size-2">
                        {ping && (
                          <span
                            className={cn(
                              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                              urgencyColor
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            "relative inline-flex size-2 rounded-full",
                            urgencyColor
                          )}
                        />
                      </span>
                    )}
                  </div>

                  {/* Task Count Pill */}
                  {dayTasks.length > 0 && (
                    <div className="mt-auto pt-1 w-full">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 truncate max-w-full">
                        {dayTasks.length} {dayTasks.length > 1 ? "tasks" : "task"}
                      </span>
                    </div>
                  )}
                </button>
              );
            },
          }}
        />
      </div>

      <ResponsiveDialog
        title={`Tasks on ${selectedDate}`}
        description={`Scheduled tasks for this day (${selectedTasks.length} total)`}
      >
        <TaskTable tasks={selectedTasks} />
      </ResponsiveDialog>
    </>
  );
}
