# NeuraTask Install-Only PWA & Web Push Notification Guide

This guide covers the architecture, deployment specifications, and cross-device testing procedures for NeuraTask as an **INSTALL-ONLY PWA** with Web Push reminders.

---

## 1. Product Invariants & Non-Negotiables

1. **Install-Only Access**:
   * NeuraTask is usable **ONLY** as an installed app on desktop (Chrome/Edge installs, macOS Safari Add to Dock) and mobile devices (Android Home Screen, iOS Home Screen).
   * In a normal browser tab, every page URL shows one install page (`components/pwa/InstallPage.tsx`) and nothing else: no app UI, no sign-in form, and zero authenticated API calls.
   * Session and data providers (`NextAuthProvider`, `QueryProvider`, push/chat sync) are completely unmounted until standalone display mode is detected.
   * Public static allow-list: `/offline`, `/privacy`, and `/terms`.
   * **Production Safety Guard**: If `NEXT_PUBLIC_ALLOW_BROWSER === "true"` in a production build, `next.config.ts` throws a build error immediately.

2. **Push-Only Reminders (Zero Email)**:
   * There is **NO email** anywhere in the reminder system. `nodemailer`, SMTP credentials (`EMAIL_*`), and email templates have been completely removed.
   * Web Push is the sole notification channel.
   * Reminders notify users when a task's due date is near (the day before and the morning of, in their local timezone) and when it becomes overdue.
   * Notification titles start with exactly **ONE** leading emoji from the Part 5B map (`⏰`, `📅`, `⚠️`, `📋`, `🔔`). No emojis appear anywhere else in title or body.
   * Privacy mode default: Task titles are shown. A user toggle in Settings ("Show task titles in notifications") switches notifications to generic wording with empty task payloads.

---

## 2. Architecture & Service Worker

### Display Mode Detection (`lib/pwa/display-mode.ts`)
* Standalone check evaluates:
  * `(display-mode: standalone)`
  * `(display-mode: fullscreen)`
  * `(display-mode: minimal-ui)`
  * `window.navigator.standalone === true` (iOS WebKit standalone)
* Detection state is **never** stored in cookies or `localStorage` to prevent Android WebAPK cookie-sharing leaks into Chrome tabs.

### Service Worker Caching Tiers (`public/sw.js`)
* **`NetworkOnly`**: All `/api/*` routes (NextAuth sessions, AI task agents, mutations) bypass SW cache completely.
* **`StaleWhileRevalidate`**: Precached shell icons, monochrome badge, offline page, and static assets (`/_next/static/*`).
* **`NetworkFirst`**: Document navigations with a 3.5s timeout, falling back cleanly to `/offline`.
* **iOS Push Compliance**: Unconditional fallback notification (`🔔 Task update`) guarantees iOS Safari compliance even when push payloads omit text.
* **Badge**: Monochrome 96x96 glyph (`/icons/badge-96x96.png`) with purpose `monochrome` for Android status bar icons.

---

## 3. Web Push Architecture & Notification Templates

### Notification Kinds & Invariants (`lib/notifications/templates.ts`)
| Kind | Leading Emoji | Description | Privacy Generic Fallback |
|---|---|---|---|
| `DUE_TODAY` | `⏰` | Task due today (morning of) | `⏰ Task due today` |
| `DUE_TOMORROW` | `📅` | Task due tomorrow (day before) | `📅 Task due tomorrow` |
| `OVERDUE` | `⚠️` | Task is past deadline | `⚠️ Task overdue` |
| `DIGEST` | `📋` | Morning summary (&ge; 3 tasks) | `📋 Daily task summary` |
| `TEST` | `🔔` | Device test notification | `🔔 Test notification` |

* **Title Grapheme Limit**: &le; 40 visual graphemes (measured via `Intl.Segmenter` to prevent truncation corruption with multi-byte emojis or RTL text).
* **Body Character Limit**: &le; 110 characters, truncated at word boundaries with `...`.
* **Sanitization**: Strips all user Markdown (`*`, `_`, `#`, `~`, `\``, `[ ]`) and user emojis from titles.
* **Idempotency**: 12-hour deduping via `NotificationLog`.
* **Nagging Limit**: Overdue tasks notify at most once every 12 hours, capped at 3 days (72 hours) maximum.

---

## 4. Vercel Environment Variables

Configure these variables in your Vercel Project (**Settings &rarr; Environment Variables**):

| Variable Name | Environment | Description |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Production & Preview | Generated VAPID public key (base64 URL-safe) |
| `VAPID_PRIVATE_KEY` | Production & Preview | Generated VAPID private key (secret) |
| `VAPID_SUBJECT` | Production & Preview | `mailto:support@neuratask.app` |
| `CRON_SECRET` | Production & Preview | Bearer token for triggering `/api/daily-task-notifications` |

---

## 5. Cross-Device Verification Checklist

### A. Normal Browser Tab (All Platforms)
1. Open `https://ai-task-manager-112.vercel.app` in a standard browser tab (Chrome, Safari, Edge, Firefox).
2. **Verify**: Only the Notion-style Install Page is rendered.
3. **Verify**: Open DevTools Network tab &rarr; zero requests to `/api/auth/session` or `/api/tasks`.
4. Click footer links &rarr; `/privacy` and `/terms` open immediately without blocking.

### B. Android (Chrome / Edge)
1. In Chrome, click **Install app** on the Install Page.
2. Launch NeuraTask from the app drawer / home screen.
3. Verify standalone window without URL bar. Sign in and use app.
4. Go to **Settings** &rarr; toggle **Push notifications (this device)** to **ON**.
5. Tap **Send test**: verify `🔔 Test notification` arrives in system tray with monochrome status badge.
6. Toggle **Show task titles in notifications** to **OFF**: verify subsequent notifications show generic text.

### C. iOS Safari (iOS 16.4+)
1. Open in Safari &rarr; Install Page instructs: tap **Share** &rarr; **Add to Home Screen**.
2. Launch NeuraTask from the Home Screen.
3. Verify full-screen standalone mode with safe-area spacing above the home bar.
4. Go to **Settings** &rarr; turn on push notifications and grant iOS permissions.
5. Tap **Send test**: verify notification arrives on lock screen / dynamic island.

### D. Desktop (macOS Safari Sonoma 14+ / Windows Chrome & Edge)
1. **macOS Safari**: Click **File** &rarr; **Add to Dock...**. Launch from Dock as standalone window.
2. **Chrome / Edge**: Click the install icon in the URL bar. Launch as desktop window.
3. Verify app shortcut: right-click app dock/taskbar icon &rarr; **Chat with agent**.

---

## 6. Running Automated Tests

```bash
# Run all audit guardrails & tenant isolation tests
npm run test

# Run Web Push infrastructure & VAPID tests
npm run test:push

# Run PWA Install Gate & platform detection tests
npm run test:gate

# Run notification template & grapheme invariant tests
npm run test:templates
```
