import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { getTasksForUser, summarizeTasks } from "@/lib/actions/task";
import { sendTaskEmailNotifications } from "@/lib/actions/notification";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  try {
    // 1️⃣ Current UTC time
    const nowUTC = DateTime.utc();
    console.log(`[CRON] Running global check at UTC ${nowUTC.toFormat("HH:mm:ss")}`);

    // 2️⃣ Fetch users with notifications enabled
    const users = await prisma.user.findMany({
      where: {
        notificationsEnabled: true,
        dailyNotificationTime: { not: null },
        timeZone: { not: null },
      },
      select: {
        id: true,
        email: true,
        dailyNotificationTime: true,
        timeZone: true,
      },
    });

    if (users.length === 0) {
      console.log("[CRON] No users with notifications enabled.");
      return NextResponse.json({ message: "No users found." }, { status: 200 });
    }

    // 3️⃣ Loop over users and compare times
    for (const user of users) {
      // Convert UTC → user's local timezone
      const userTime = nowUTC.setZone(user.timeZone || "");

      // Compare formatted "HH:mm" time with user's notificationTime
      if (userTime.toFormat("HH:mm") !== user.dailyNotificationTime) {
        console.log(
          `[CRON] Skipping ${user.email} — local time ${userTime.toFormat("HH:mm")} ≠ ${user.dailyNotificationTime} (${user.timeZone})`
        );
        continue;
      }

      console.log(`[CRON] Sending daily task summary to ${user.email} (${user.timeZone})`);

      // Get tasks for this specific user (not session-based)
      const tasks = await getTasksForUser(user.id);
      if (!tasks || tasks.length === 0) {
        console.log(`[CRON] No tasks for ${user.email}`);
        continue;
      }

      const summary = await summarizeTasks(tasks);
      await sendTaskEmailNotifications(tasks, summary as string);
      console.log(`[CRON] Notification sent to ${user.email}`);
    }

    return NextResponse.json({ message: "Global cron executed successfully." }, { status: 200 });
  } catch (error) {
    console.error("[CRON ERROR]", error);
    return NextResponse.json({ message: "Cron execution failed." }, { status: 500 });
  }
}
