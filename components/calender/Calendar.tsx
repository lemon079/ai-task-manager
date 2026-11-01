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
          className="rounded-md border border-border/80 p-3 size-full bg-card"
          components={{
            DayButton: ({ day, ...props }) => {
              const key = formatDateKey(day.date);
              const dayTasks = tasksByDate.get(key) ?? [];
              const isTodayCell = key === todayKey;
              const hasTasks = dayTasks.length > 0;

              return (
                <button
                  {...props}
                  className={cn(
                    "relative flex flex-col items-center justify-center border text-center",
                    "size-full min-h-[58px] sm:min-h-[64px] p-1.5 transition-colors cursor-pointer rounded-md",
                    "border-border/40 hover:bg-muted/50 hover:border-border",
                    isTodayCell && "bg-muted/40 font-semibold text-foreground ring-1 ring-primary/40"
                  )}
                  onClick={() => {
                    if (!hasTasks) return;
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
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isTodayCell ? "text-primary font-semibold" : "text-foreground"
                    )}
                  >
                    {day.date.getDate()}
                  </span>

                  {/* Small minimal task dots indicator */}
                  {hasTasks && (
                    <div className="flex items-center gap-0.5 mt-1">
                      <span className="size-1 rounded-full bg-primary shrink-0" />
                      {dayTasks.length > 1 && (
                        <span className="text-[10px] text-muted-foreground font-medium tabular-nums leading-none">
                          +{dayTasks.length - 1}
                        </span>
                      )}
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
        description={`${selectedTasks.length} scheduled task${selectedTasks.length > 1 ? "s" : ""}`}
      >
        <TaskTable tasks={selectedTasks} />
      </ResponsiveDialog>
    </>
  );
}
