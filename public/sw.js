// NeuraTask Production-Grade Service Worker
// Version: 1.0.0

const CACHE_NAME = "neuratask-static-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/favicon.ico",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/icons/badge-72x72.png",
  "/manifest.webmanifest",
];

// 1. Install Event: Precache App Shell & Offline Fallback
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn("[SW] Precache asset fetch failure:", err);
      }
    })
  );
  // Do NOT skipWaiting immediately so active sessions are not disrupted mid-typing
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[SW] Purging outdated cache: ${key}`);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Strict Tiered Caching Policy
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // RULE A: ONLY GET requests are cacheable. POST/PUT/DELETE/Server Actions are STRICT NETWORK-ONLY.
  if (req.method !== "GET") {
    return;
  }

  // RULE B: Ignore non-http/https (e.g. chrome-extension, blob, data)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // RULE C: STRICT NETWORK-ONLY for authenticated APIs, AI streaming, and Auth routes
  // NEVER cache /api/auth/*, /api/agents/*, or any API routes
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  // RULE D: Static Assets (/_next/static/*, /icons/*, fonts) -> Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico");

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes.ok && networkRes.status === 200) {
              cache.put(req, networkRes.clone());
            }
            return networkRes;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // RULE E: HTML Navigation Requests -> Network-First with Offline Fallback
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Timeout network after 3 seconds for fast offline fallback
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const networkResponse = await fetch(req, { signal: controller.signal });
          clearTimeout(timeoutId);

          return networkResponse;
        } catch (err) {
          console.warn("[SW] Navigation failed, checking offline fallback:", err);
          const cachedResponse = await caches.match(req);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return precached offline fallback page
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }

          return new Response("You are currently offline.", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })()
    );
    return;
  }
});

// 4. Message Event: Skip Waiting and Clear Private Data on Sign Out
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Sign out privacy guarantee: sweep all non-static caches immediately
  if (event.data.type === "CLEAR_PRIVATE_CACHE") {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      // Re-open clean cache and re-cache only offline shell
      caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS));
    });
  }
});

// 5. Web Push Notification Event Handler (Phase 3 Support)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || "NeuraTask Notification";
    const options = {
      body: payload.body || "You have an upcoming task deadline.",
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-72x72.png",
      tag: payload.tag || "neuratask-notification",
      renotify: true,
      data: {
        url: payload.url || "/dashboard",
        taskId: payload.taskId,
      },
      vibrate: [100, 50, 100],
    };

    event.waitUntil(
      self.registration.showNotification(title, options).then(() => {
        if ("setAppBadge" in navigator && typeof payload.badgeCount === "number") {
          navigator.setAppBadge(payload.badgeCount).catch(() => {});
        }
      })
    );
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("NeuraTask", {
        body: text,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
      })
    );
  }
});

// 6. Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // If user tapped "Dismiss", do nothing
  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If an existing window is open on this origin, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// 7. Push Subscription Change Handler
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription?.options || { userVisibleOnly: true })
      .then((newSub) => {
        return fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSub),
        });
      })
      .catch((err) => {
        console.error("[SW] Push subscription resubscribe error:", err);
      })
  );
});
