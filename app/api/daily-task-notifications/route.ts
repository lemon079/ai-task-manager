import { NextResponse } from "next/server";
import { getTasks, summarizeTasks } from "@/lib/actions/task";
import { sendTaskEmailNotifications } from "@/lib/actions/notification";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // → "HH:MM"

    console.log(`[CRON] Running at ${currentTime}`);

    // Step 1: Fetch users who have notifications enabled
    const users = await prisma.user.findMany({
      where: {
        notificationsEnabled: true,
        dailyNotificationTime: { not: null },
      },
      select: {
        id: true,
        email: true,
        dailyNotificationTime: true,
      },
    });

    if (users.length === 0) {
      console.log("[CRON] No users with notifications enabled.");
      return NextResponse.json({ message: "No users found." }, { status: 200 });
    }

    // Step 2: For each user, check their notification time
    for (const user of users) {
      if (user.dailyNotificationTime !== currentTime) {
        console.log(
          `[CRON] Skipping ${user.email} — not their notification time.`
        );
        continue;
      }

      console.log(`[CRON] Sending daily task summary to ${user.email}`);

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
      { message: "Cron executed successfully." },
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
