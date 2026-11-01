import webpush from "web-push";
import { prisma } from "@/prisma/prisma";
import { DateTime } from "luxon";
import { buildNotification } from "@/lib/notifications/templates";

// Ensure VAPID details are configured once
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@neuratask.app";

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.error("[WebPush] Failed to set VAPID details:", err);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  taskId?: string;
  actions?: Array<{ action: string; title: string }>;
}

export async function sendWebPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<{ success: boolean; expired?: boolean; error?: string }> {
  try {
    const pushSub = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-96x96.png",
      tag: payload.tag || "neuratask-notification",
      data: {
        url: payload.url || "/dashboard",
        taskId: payload.taskId,
      },
    });

    await webpush.sendNotification(pushSub, notificationPayload);
    return { success: true };
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    // HTTP 404 or 410 indicates the push subscription has expired or been revoked
    if (error.statusCode === 404 || error.statusCode === 410) {
      return { success: false, expired: true, error: "Subscription expired or revoked" };
    }
    return { success: false, error: error.message || "Failed to send notification" };
  }
}

/**
 * Dispatches a push notification to all active devices registered to a user.
 * Automatically prunes any subscriptions that have expired (404/410).
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
  logType?: string
): Promise<{ sent: number; failed: number; expiredPruned: number }> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0, expiredPruned: 0 };
  }

  let sent = 0;
  let failed = 0;
  let expiredPruned = 0;

  for (const sub of subscriptions) {
    const result = await sendWebPushToSubscription(sub, payload);
    if (result.success) {
      sent++;
    } else {
      failed++;
      if (result.expired) {
        // Prune stale device subscription
        try {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
          expiredPruned++;
        } catch {
          // Ignore if already deleted
        }
      }
    }
  }

  // Record in NotificationLog if logType provided
  if (logType && sent > 0) {
    try {
      await prisma.notificationLog.create({
        data: {
          userId,
          taskId: payload.taskId || null,
          type: logType,
        },
      });
    } catch (e) {
      console.warn("[WebPush] Failed to record notification log:", e);
    }
  }

  return { sent, failed, expiredPruned };
}

/**
 * Checks whether a notification of a given type was recently sent for this task/user
 * to ensure strict idempotency and avoid spamming the user.
 */
export async function wasRecentlySent(
  userId: string,
  taskId: string | null,
  type: string,
  hoursThreshold = 12
): Promise<boolean> {
  const cutoff = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
  const existing = await prisma.notificationLog.findFirst({
    where: {
      userId,
      taskId: taskId || undefined,
      type,
      sentAt: { gte: cutoff },
    },
  });
  return !!existing;
}

/**
 * Sweeps all users with registered push devices and dispatches notifications
 * for upcoming and overdue tasks, enforcing strict 12h idempotency.
 */
export async function dispatchDuePushNotifications(): Promise<{
  overdueSent: number;
  dueTodaySent: number;
  dueTomorrowSent: number;
  digestSent: number;
}> {
  // Find users who have at least one active push subscription
  const usersWithPush = await prisma.user.findMany({
    where: {
      notificationsEnabled: true,
      pushSubscriptions: { some: {} },
    },
    select: {
      id: true,
      email: true,
      name: true,
      timeZone: true,
      dailyNotificationTime: true,
    },
  });

  if (usersWithPush.length === 0) {
    return { overdueSent: 0, dueTodaySent: 0, dueTomorrowSent: 0, digestSent: 0 };
  }

  const nowUTC = DateTime.utc();
  const threeDaysAgo = nowUTC.minus({ days: 3 }).toJSDate();

  let overdueSent = 0;
  let dueTodaySent = 0;
  let dueTomorrowSent = 0;
  let digestSent = 0;

  for (const user of usersWithPush) {
    const userZone = user.timeZone || "UTC";
    const userNow = nowUTC.setZone(userZone);
    const userStartOfDay = userNow.startOf("day").toJSDate();
    const userEndOfDay = userNow.endOf("day").toJSDate();
    const userStartOfTomorrow = userNow.plus({ days: 1 }).startOf("day").toJSDate();
    const userEndOfTomorrow = userNow.plus({ days: 1 }).endOf("day").toJSDate();

    // Fetch user's pending/in-progress tasks with due dates
    const pendingTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        status: { in: ["pending", "in_progress", "over_due"] },
        dueDate: { not: null },
      },
      orderBy: { dueDate: "asc" },
    });

    if (pendingTasks.length === 0) continue;

    // Partition tasks
    const overdueTasks = pendingTasks.filter(
      (t) => t.dueDate && t.dueDate < userNow.toJSDate() && t.dueDate >= threeDaysAgo
    );
    const dueTodayTasks = pendingTasks.filter(
      (t) => t.dueDate && t.dueDate >= userStartOfDay && t.dueDate <= userEndOfDay
    );
    const dueTomorrowTasks = pendingTasks.filter(
      (t) => t.dueDate && t.dueDate >= userStartOfTomorrow && t.dueDate <= userEndOfTomorrow
    );

    const totalActive = overdueTasks.length + dueTodayTasks.length + dueTomorrowTasks.length;

    // Morning Digest Check: at local morning time (e.g. 09:00), if >= 3 tasks due/overdue
    const isMorningTime = userNow.toFormat("HH:mm") === (user.dailyNotificationTime || "09:00");
    if (isMorningTime && totalActive >= 3) {
      const alreadySentDigest = await wasRecentlySent(user.id, null, "DIGEST", 18);
      if (!alreadySentDigest) {
        const digestTasks = [...dueTodayTasks, ...overdueTasks, ...dueTomorrowTasks];
        const notification = buildNotification("DIGEST", digestTasks, {
          timeZone: userZone,
          userName: user.name,
        });

        const res = await sendPushToUser(
          user.id,
          {
            title: notification.title,
            body: notification.body,
            url: notification.url,
            tag: notification.tag,
          },
          "DIGEST"
        );

        if (res.sent > 0) {
          digestSent++;
          continue; // Skip individual task notifications for this morning sweep
        }
      }
    }

    // Individual Task Sweeps (with 12h idempotency)
    // 1. Overdue Tasks (nagging limit: once per 12h, max 3 days past due)
    for (const task of overdueTasks) {
      const alreadySent = await wasRecentlySent(user.id, task.id, "OVERDUE", 12);
      if (!alreadySent) {
        const notif = buildNotification("OVERDUE", [task], { timeZone: userZone });
        const res = await sendPushToUser(
          user.id,
          {
            title: notif.title,
            body: notif.body,
            taskId: task.id,
            url: notif.url,
            tag: notif.tag,
          },
          "OVERDUE"
        );
        if (res.sent > 0) overdueSent++;
      }
    }

    // 2. Tasks Due Today (morning of)
    for (const task of dueTodayTasks) {
      const alreadySent = await wasRecentlySent(user.id, task.id, "DUE_TODAY", 12);
      if (!alreadySent) {
        const notif = buildNotification("DUE_TODAY", [task], { timeZone: userZone });
        const res = await sendPushToUser(
          user.id,
          {
            title: notif.title,
            body: notif.body,
            taskId: task.id,
            url: notif.url,
            tag: notif.tag,
          },
          "DUE_TODAY"
        );
        if (res.sent > 0) dueTodaySent++;
      }
    }

    // 3. Tasks Due Tomorrow (day before)
    for (const task of dueTomorrowTasks) {
      const alreadySent = await wasRecentlySent(user.id, task.id, "DUE_TOMORROW", 12);
      if (!alreadySent) {
        const notif = buildNotification("DUE_TOMORROW", [task], { timeZone: userZone });
        const res = await sendPushToUser(
          user.id,
          {
            title: notif.title,
            body: notif.body,
            taskId: task.id,
            url: notif.url,
            tag: notif.tag,
          },
          "DUE_TOMORROW"
        );
        if (res.sent > 0) dueTomorrowSent++;
      }
    }
  }

  return { overdueSent, dueTodaySent, dueTomorrowSent, digestSent };
}
