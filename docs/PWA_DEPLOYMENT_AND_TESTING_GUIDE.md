# NeuraTask PWA & Web Push Notification Guide

This guide covers the architecture, deployment requirements, and cross-device testing procedures for NeuraTask's Progressive Web App (PWA) with Web Push notifications.

---

## 1. Architecture Overview

### Service Worker Caching Tiers (`public/sw.js`)
* **`NetworkOnly`**: All `/api/*` requests (including NextAuth `/api/auth/*` and LangChain `/api/agents/*`) and non-GET requests bypass the Service Worker cache completely.
* **`StaleWhileRevalidate`**: Static assets (`/_next/static/*`, `/icons/*`, fonts) are served immediately from cache while being updated in the background.
* **`NetworkFirst`**: Document navigations attempt a network fetch with a 3.5s timeout, falling back cleanly to `/offline` if disconnected.
* **Sign-out Privacy Guarantee**: Dispatching `CLEAR_PRIVATE_CACHE` to the Service Worker purges all non-static caches immediately.
* **Lifecycle**: Listens for `SKIP_WAITING` without blocking active input fields or active chat streams.

### Web Push & VAPID Flow
```
User Device (Browser / PWA)
      │
      │ 1. Requests Notification.permission
      │ 2. pushManager.subscribe({ applicationServerKey: VAPID_PUBLIC_KEY })
      ▼
NeuraTask API (/api/push/subscribe)
      │
      │ 3. Upserts PushSubscription in Neon Postgres
      ▼
Cron / Notification Engine (lib/push.ts)
      │
      │ 4. Checks NotificationLog for 12h idempotency
      │ 5. webpush.sendNotification(subscription, payload)
      ▼
Apple / Google / Mozilla Push Service
      │
      ▼
Device Service Worker (public/sw.js: 'push' event)
      │
      │ 6. showNotification(title, { body, icon, badge, data, actions })
      ▼
User taps notification / action button
      │
      │ 7. 'notificationclick' event focuses tab or opens target task URL
```

---

## 2. Vercel Production Environment Variables

To enable Web Push on Vercel preview and production environments, configure these environment variables in your Vercel Dashboard (**Project Settings &rarr; Environment Variables**):

| Variable Name | Environment | Value Description |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Production & Preview | `BBdsQRyhLf3YyGgZFs5VewfqbW9zcU60i6VFiinw3bNBquEr1eUV7_WgukFma8HZFiPFZB71f3K6VKixe-95Rtw` |
| `VAPID_PRIVATE_KEY` | Production & Preview | `fLRfo1nYUXy8FxVp85aMz5puH5YVV29rkWtEJksyF6o` |
| `VAPID_SUBJECT` | Production & Preview | `mailto:support@neuratask.app` |

---

## 3. Cross-Device Verification Checklist

### A. Android & Chrome / Edge
1. Navigate to the NeuraTask web app in Chrome or Edge.
2. Verify the custom install banner appears after 3 seconds, or click the browser install icon in the address bar.
3. Click **Install**.
4. Launch NeuraTask from the app drawer / home screen.
5. Verify standalone display mode (no browser URL bar).
6. Go to **Settings** and toggle **Push notifications (this device)** to **ON**.
7. Tap **Send test** and verify the notification appears in the system tray.
8. Tap the notification: verify it opens and focuses the app.
9. Disconnect Wi-Fi and mobile data: verify the app loads cached assets and navigates to the custom `/offline` page.

### B. iOS Safari (iOS 16.4+)
> [!NOTE]
> On iOS, Apple requires PWAs to be installed on the Home Screen before the Web Push API (`PushManager`) is enabled.

1. Open NeuraTask in Mobile Safari.
2. Tap the Safari **Share** button in the bottom navigation bar.
3. Scroll down and tap **Add to Home Screen**.
4. Confirm the app icon and name ("NeuraTask") and tap **Add**.
5. Launch NeuraTask directly from your Home Screen.
6. Verify full-screen standalone mode with safe-area spacing above the home indicator.
7. Navigate to **Settings** and switch **Push notifications (this device)** to **ON**.
8. Grant notification permission when prompted by iOS.
9. Tap **Send test** and verify the push notification appears on the lock screen / Notification Center.

### C. Desktop (macOS / Windows / Linux)
1. Open NeuraTask in Chrome, Edge, or Brave.
2. Click the install icon in the URL bar to install as a desktop application.
3. Verify window title bar, shortcuts ("Add Task", "Chat with Agent"), and responsive navigation.

---

## 4. Idempotent Cron Execution

The cron endpoint at `/api/daily-task-notifications` handles both daily morning briefings and due-date push notifications:

```bash
# Manual trigger test (replace with your CRON_SECRET)
curl -X GET "https://ai-task-manager-112.vercel.app/api/daily-task-notifications" \
     -H "Authorization: Bearer c665f0b6534a304a"
```

**Guarantees**:
* **12-Hour Idempotency**: `NotificationLog` records every successful dispatch for `(userId, taskId, type)`. Duplicate reminders within 12 hours are suppressed.
* **Automatic Stale Device Pruning**: If a push service returns HTTP 404 or 410 (unsubscribed or uninstalled device), that subscription is automatically purged from the database.
