"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@prisma/client";
import { cn } from "@/lib/utils";
import TaskTable from "../tasks/TaskTable";
import { ResponsiveDialog } from "../shared/ResponsiveDialog";
import { useModalContext } from "@/hooks/useModalContext";

export function ScheduleCalendar({ tasks }: { tasks: Task[] }) {
  const today = useMemo(() => new Date(), []);
  const { setModalOpen } = useModalContext();
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Group tasks by dueDate
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = new Date(task.dueDate).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    return map;
  }, [tasks]);

  // Determine urgency-based color
  const getUrgencyColor = useCallback(
    (dayTasks: Task[]): string => {
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
    },
    [today]
  );

  return (
    <>
      <Calendar
        mode="single"
        className="rounded-lg border shadow-sm mt-5 size-full"
        components={{
          DayButton: ({ day, ...props }) => {
            const key = day.date.toDateString();
            const dayTasks = useMemo(() => tasksByDate.get(key) ?? [], [key]);

            const urgencyColor = getUrgencyColor(dayTasks);

            // Track new task appearance
            const prevCount = useRef(0);
            const [isNew, setIsNew] = useState(false);

            useEffect(() => {
              if (dayTasks.length > prevCount.current) {
                setIsNew(true);
                const timeout = setTimeout(() => setIsNew(false), 1000);
                return () => clearTimeout(timeout);
              }
              prevCount.current = dayTasks.length;
            }, [dayTasks.length]);

            return (
              <button
                {...props}
                className={cn(
                  "relative flex flex-col items-start justify-start border text-left",
                  "size-full min-h-[80px] p-1 transition-colors cursor-pointer hover:bg-gray-50"
                )}
                onClick={() => {
                  if (dayTasks.length === 0) return;
                  setSelectedTasks(dayTasks);
                  setSelectedDate(key);
                  setModalOpen(true);
                }}
              >
                <div className="font-semibold text-sm">{day.date.getDate()}</div>

                {/* Ping Indicator */}
                {dayTasks.length > 0 && (
                  <div className="absolute top-1 right-1 flex items-center justify-center">
                    <span
                      className={cn(
                        "relative inline-flex size-3 rounded-full",
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

                {/* Optional task count display */}
                {dayTasks.length > 0 && (
                  <div className="mt-auto text-xs text-gray-600 font-medium">
                    {dayTasks.length} {dayTasks.length > 1 ? "Tasks" : "Task"}
                  </div>
                )}
              </button>
            );
          },
        }}
      />

      <ResponsiveDialog
        title={`Tasks on ${selectedDate}`}
        description={`You have ${selectedTasks.length} task(s)`}
      >
        <TaskTable tasks={selectedTasks} />
      </ResponsiveDialog>
    </>
  );
}
