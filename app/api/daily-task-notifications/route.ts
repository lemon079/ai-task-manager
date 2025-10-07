import { NextResponse } from "next/server";
import { getTasks, summarizeTasks } from "@/lib/actions/task";
import { sendTaskEmailNotifications } from "@/lib/actions/notification";
import { prisma } from "@/prisma/prisma";
import { DateTime } from "luxon"; // for timeZone conversions

export async function GET() {
  try {
    const nowUtc = DateTime.utc(); // current UTC time

    console.log(`[CRON] Running at UTC ${nowUtc.toFormat("HH:mm")}`);

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
      console.log("[CRON] No users found.");
      return NextResponse.json({ message: "No users found." });
    }

    for (const user of users) {
      const userLocalTime = nowUtc.setZone(user.timeZone!);
      const currentLocalTime = userLocalTime.toFormat("HH:mm");

      if (currentLocalTime !== user.dailyNotificationTime) {
        console.log(
          `[CRON] Skipping ${user.email} — local time ${currentLocalTime}, wants ${user.dailyNotificationTime} (${user.timeZone}).`
        );
        continue;
      }

      console.log(`[CRON] Sending daily summary to ${user.email}`);

      const tasks = await getTasks(); // ideally fetch tasks by user.id

      if (!tasks || tasks.length === 0) {
        console.log(`[CRON] No tasks for ${user.email}`);
        continue;
      }

      const summary = await summarizeTasks(tasks);
      await sendTaskEmailNotifications(tasks, summary as string);

      console.log(`[CRON] Notification sent to ${user.email}`);
    }

    return NextResponse.json({ message: "Cron executed successfully." });
  } catch (error) {
    console.error("[CRON ERROR]", error);
    return NextResponse.json({ message: "Cron failed." }, { status: 500 });
  }
}
