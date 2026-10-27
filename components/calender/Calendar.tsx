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

function getUrgencyColor(dayTasks: Task[], today: Date): string {
  if (dayTasks.length === 0) return "bg-transparent";

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

  if (nearestDiff < 0) return "bg-red-500"; // overdue
  if (nearestDiff === 0) return "bg-orange-500"; // today
  if (nearestDiff <= 3) return "bg-yellow-400"; // soon
  if (nearestDiff <= 7) return "bg-green-400"; // next week
  return "bg-gray-300"; // distant
}

export function ScheduleCalendar({ tasks }: { tasks: Task[] }) {
  const today = useMemo(() => new Date(), []);
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
      <Calendar
        mode="single"
        className="rounded-lg border shadow-sm mt-5 size-full"
        components={{
          DayButton: ({ day, ...props }) => {
            const key = formatDateKey(day.date);
            const dayTasks = tasksByDate.get(key) ?? [];
            const urgencyColor = getUrgencyColor(dayTasks, today);

            return (
              <button
                {...props}
                className={cn(
                  "relative flex flex-col items-start justify-start border text-left",
                  "size-full min-h-[80px] p-1.5 transition-colors cursor-pointer hover:bg-muted/50 rounded-md",
                  dayTasks.length > 0 ? "border-primary/30" : "border-border"
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
                <div className="font-semibold text-sm">{day.date.getDate()}</div>

                {/* Ping Indicator */}
                {dayTasks.length > 0 && (
                  <div className="absolute top-1.5 right-1.5 flex items-center justify-center">
                    <span
                      className={cn(
                        "relative inline-flex size-2.5 rounded-full",
                        urgencyColor
                      )}
                    >
                      <span
                        className={cn(
                          "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                          urgencyColor
                        )}
                      />
                    </span>
                  </div>
                )}

                {/* Task count display */}
                {dayTasks.length > 0 && (
                  <div className="mt-auto text-xs text-muted-foreground font-medium truncate w-full">
                    {dayTasks.length} {dayTasks.length > 1 ? "tasks" : "task"}
                  </div>
                )}
              </button>
            );
          },
        }}
      />

      <ResponsiveDialog
        title={`Tasks on ${selectedDate}`}
        description={`You have ${selectedTasks.length} scheduled task(s)`}
      >
        <TaskTable tasks={selectedTasks} />
      </ResponsiveDialog>
    </>
  );
}
