"use client";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn("[Push] Error getting subscription:", err);
    return null;
  }
}

/**
 * Resolves the VAPID public key.
 * Tries build-time NEXT_PUBLIC_VAPID_PUBLIC_KEY first,
 * then falls back to fetching dynamically from the server route.
 */
export async function getVapidPublicKey(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  }

  try {
    const res = await fetch("/api/push/subscribe");
    if (res.ok) {
      const data = await res.json();
      if (data?.vapidPublicKey) {
        return data.vapidPublicKey;
      }
    }
  } catch (err) {
    console.warn("[Push] Failed to fetch server VAPID key:", err);
  }

  return null;
}

export async function subscribeToPush(): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { success: false, error: "Web push is not supported in this browser." };
  }

  const vapidPublicKey = await getVapidPublicKey();
  if (!vapidPublicKey) {
    return {
      success: false,
      error:
        "Push notification VAPID public key is not configured. Please add NEXT_PUBLIC_VAPID_PUBLIC_KEY in your deployment environment variables.",
    };
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Notification permission was denied." };
    }

    // 2. Ensure Service Worker is registered and active
    const registration = await navigator.serviceWorker.ready;

    // Clean up any stale subscription (e.g. from prior key rotation)
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe().catch(() => {});
    }

    // 3. Subscribe with VAPID applicationServerKey
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey as unknown as BufferSource,
    });

    const subJson = subscription.toJSON();

    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      return { success: false, error: "Malformed push subscription received from browser." };
    }

    // 4. Send subscription to server
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
        userAgent: navigator.userAgent,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || "Server failed to save subscription." };
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[Push] Subscription error:", err);
    return { success: false, error: error.message || "Failed to subscribe to push notifications." };
  }
}

export async function unsubscribeFromPush(): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { success: false, error: "Push notifications not supported." };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Tell server to remove this subscription
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[Push] Unsubscribe error:", err);
    return { success: false, error: error.message || "Failed to unsubscribe." };
  }
}
