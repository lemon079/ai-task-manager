import { NextResponse } from "next/server";
import { getTasks, summarizeTasks } from "@/lib/actions/task";
import { sendTaskEmailNotifications } from "@/lib/actions/notification";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  try {
    const nowUTC = new Date();

    console.log(
      `[CRON] Running global check at UTC ${nowUTC.toISOString().slice(11, 16)}`
    );

    // Step 1: Fetch users who have notifications enabled
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

    // Step 2: For each user, convert current UTC → user's local time
    for (const user of users) {
      const userLocalTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: user.timeZone || "",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(nowUTC); // e.g. "07:30"

      if (userLocalTime !== user.dailyNotificationTime) {
        console.log(
          `[CRON] Skipping ${user.email} — current local time ${userLocalTime} ≠ ${user.dailyNotificationTime} (${user.timeZone})`
        );
        continue;
      }

      console.log(
        `[CRON] Sending daily task summary to ${user.email} (${user.timeZone})`
      );

      // Step 3: Get the user’s tasks
      const tasks = await getTasks();

      if (!tasks || tasks.length === 0) {
        console.log(`[CRON] No tasks for ${user.email}`);
        continue;
      }

      // Step 4: Summarize and send notification
      const summary = await summarizeTasks(tasks);
      await sendTaskEmailNotifications(tasks, summary as string);

      console.log(`[CRON] Notification sent to ${user.email}`);
    }

    return NextResponse.json(
      { message: "Global cron executed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CRON ERROR]", error);
    return NextResponse.json(
      { message: "Cron execution failed." },
      { status: 500 }
    );
  }
}
