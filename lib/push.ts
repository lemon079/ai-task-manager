import webpush from "web-push";
import { prisma } from "@/prisma/prisma";

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
      badge: payload.badge || "/icons/badge-72x72.png",
      tag: payload.tag || "neuratask-notification",
      data: {
        url: payload.url || "/dashboard",
        taskId: payload.taskId,
      },
      actions: payload.actions || [
        { action: "open", title: "View" },
        { action: "dismiss", title: "Dismiss" },
      ],
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
  dueSoonSent: number;
}> {
  // Find users who have at least one active push subscription
  const usersWithPush = await prisma.user.findMany({
    where: {
      notificationsEnabled: true,
      pushSubscriptions: { some: {} },
    },
    select: { id: true, email: true },
  });

  if (usersWithPush.length === 0) {
    return { overdueSent: 0, dueSoonSent: 0 };
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  let overdueSent = 0;
  let dueSoonSent = 0;

  for (const user of usersWithPush) {
    // Fetch user's uncompleted tasks with due dates
    const pendingTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        status: { in: ["pending", "in_progress", "over_due"] },
        dueDate: { not: null },
      },
    });

    for (const task of pendingTasks) {
      if (!task.dueDate) continue;

      const isOverdue = task.dueDate < now;
      const isDueToday = task.dueDate >= startOfDay && task.dueDate <= endOfDay;

      if (isOverdue) {
        const alreadySent = await wasRecentlySent(user.id, task.id, "OVERDUE", 12);
        if (!alreadySent) {
          const res = await sendPushToUser(
            user.id,
            {
              title: "Task Overdue",
              body: `"${task.title}" is overdue. Tap to update or complete it.`,
              taskId: task.id,
              url: "/task-ai",
              tag: `overdue-${task.id}`,
            },
            "OVERDUE"
          );
          if (res.sent > 0) overdueSent++;
        }
      } else if (isDueToday) {
        const alreadySent = await wasRecentlySent(user.id, task.id, "DUE_SOON", 12);
        if (!alreadySent) {
          const res = await sendPushToUser(
            user.id,
            {
              title: "Task Due Today",
              body: `"${task.title}" is scheduled for completion today.`,
              taskId: task.id,
              url: "/task-ai",
              tag: `duesoon-${task.id}`,
            },
            "DUE_SOON"
          );
          if (res.sent > 0) dueSoonSent++;
        }
      }
    }
  }

  return { overdueSent, dueSoonSent };
}
