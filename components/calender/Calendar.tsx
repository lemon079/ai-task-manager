"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@prisma/client";
import { cn } from "@/lib/utils";
import { priorityColors } from "@/types/util-types";
import { useModalContext } from "@/app/hooks/useModalContext";
import { Button } from "../ui/button";
import TaskTable from "../tasks/TaskTable";
import { ResponsiveDialog } from "../shared/ResponsiveDialog";

export function ScheduleCalendar({ tasks }: { tasks: Task[] }) {
  const today = useMemo(() => new Date(), []);
  const { setModalOpen } = useModalContext();
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // group tasks by dueDate
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

  // background calculator
  const getBackground = useCallback(
    (dayTasks: Task[]): string => {
      if (dayTasks.length === 0) return "bg-white";

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

      if (nearestDiff < 0) return "bg-red-100"; // overdue
      if (nearestDiff === 0) return "bg-orange-400"; // due today
      if (nearestDiff <= 3) return "bg-yellow-100"; // soon
      if (nearestDiff <= 7) return "bg-green-100"; // next week
      return "bg-gray-50"; // far away
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

            // keep track of previous task count
            const prevCount = useRef(0);
            const [isNew, setIsNew] = useState(false);

            useEffect(() => {
              if (dayTasks.length > prevCount.current) {
                setIsNew(true);
                const timeout = setTimeout(() => setIsNew(false), 1000); // 1s pulse
                return () => clearTimeout(timeout);
              }
              prevCount.current = dayTasks.length;
            }, [dayTasks.length]);

            // group by priority
            const grouped = useMemo(
              () =>
                dayTasks.reduce<Record<string, number>>((acc, task) => {
                  acc[task.priority] = (acc[task.priority] || 0) + 1;
                  return acc;
                }, {}),
              [dayTasks]
            );

            const bgClass = getBackground(dayTasks);

            // If no tasks → normal button
            if (dayTasks.length === 0) {
              return (
                <Button
                  {...props}
                  variant={"secondary"}
                  className={cn(
                    "relative flex flex-col items-start justify-start border text-left",
                    "size-full min-h-[80px] p-1 hover:opacity-90 transition-colors",
                    bgClass
                  )}
                >
                  <div className="font-semibold text-sm">
                    {day.date.getDate()}
                  </div>
                </Button>
              );
            }

            // If tasks exist → open modal on click
            return (
              <button
                title="Open"
                {...props}
                className={cn(
                  "relative flex flex-col items-start justify-start border text-left",
                  "size-full min-h-[80px] p-1 hover:opacity-90 transition-colors cursor-pointer",
                  bgClass
                )}
                onClick={() => {
                  setSelectedTasks(dayTasks);
                  setSelectedDate(key);
                  setModalOpen(true); // ✅ open modal
                }}
              >
                <div className="font-semibold text-sm">
                  {day.date.getDate()}
                </div>

                <div className="mt-1 flex flex-col gap-1">
                  {Object.entries(grouped).map(([priority, count]) => (
                    <div
                      key={priority}
                      className="relative flex items-center gap-1 text-xs text-gray-700 font-semibold"
                    >
                      {isNew && (
                        <span
                          className={cn(
                            "absolute inline-flex size-3 rounded-full opacity-75 animate-ping",
                            priorityColors[priority]
                          )}
                        />
                      )}
                      {count > 1 ? `${count} Tasks` : '1 Task'}
                    </div>
                  ))}
                </div>
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
