import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { successResponse, ApiErrors, withErrorHandler } from "@/lib/api-utils";

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Dedicated Calendar Module API
 * Returns user's tasks structured for schedule and calendar visualization
 */
export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const userId = session.user.id;
    const now = new Date();

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
    });

    const calendarMap: Record<string, typeof tasks> = {};
    let overdueCount = 0;
    let todayCount = 0;
    let upcomingCount = 0;
    let unscheduledCount = 0;

    const todayKey = formatDateKey(now);

    for (const task of tasks) {
      if (!task.dueDate) {
        unscheduledCount++;
        continue;
      }

      const dateKey = formatDateKey(new Date(task.dueDate));
      if (!calendarMap[dateKey]) {
        calendarMap[dateKey] = [];
      }
      calendarMap[dateKey].push(task);

      if (task.status !== "completed") {
        if (dateKey < todayKey) {
          overdueCount++;
        } else if (dateKey === todayKey) {
          todayCount++;
        } else {
          upcomingCount++;
        }
      }
    }

    return successResponse({
      calendar: calendarMap,
      tasks,
      metrics: {
        total: tasks.length,
        today: todayCount,
        upcoming: upcomingCount,
        overdue: overdueCount,
        unscheduled: unscheduledCount,
      },
    });
  });
}
