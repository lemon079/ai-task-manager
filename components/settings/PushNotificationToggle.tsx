"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Send, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  isPushSupported,
  getPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";

export default function PushNotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isIosBrowser, setIsIosBrowser] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasPush = isPushSupported();
    setSupported(hasPush);

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Detect iOS in browser (Safari) vs Standalone
    const userAgent = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isIos && !isStandalone) {
      setIsIosBrowser(true);
    }

    if (hasPush) {
      getPushSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    }
  }, []);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      if (checked) {
        const result = await subscribeToPush();
        if (result.success) {
          setIsSubscribed(true);
          setPermission("granted");
          toast.success("Push notifications enabled on this device!");
        } else {
          toast.error(result.error || "Failed to enable push notifications.");
          if ("Notification" in window) {
            setPermission(Notification.permission);
          }
        }
      } else {
        const result = await unsubscribeFromPush();
        if (result.success) {
          setIsSubscribed(false);
          toast.success("Push notifications disabled on this device.");
        } else {
          toast.error(result.error || "Failed to disable push notifications.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Test notification sent! Check your device notifications.");
      } else {
        toast.error(data.message || data.error || "Failed to send test notification.");
      }
    } catch {
      toast.error("Network error while sending test notification.");
    } finally {
      setTesting(false);
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center justify-between p-3.5 sm:p-4">
        <div className="space-y-0.5 pr-4">
          <Label className="text-xs font-medium text-foreground">
            Push notifications
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Web push notifications are not supported in this browser environment.
          </p>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <BellOff className="size-3.5" />
          Unsupported
        </span>
      </div>
    );
  }

  if (isIosBrowser) {
    return (
      <div className="flex flex-col gap-2 p-3.5 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <Label className="text-xs font-medium text-foreground">
              Push notifications on iOS
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Requires installing NeuraTask to your Home Screen.
            </p>
          </div>
          <Bell className="size-4 text-muted-foreground" />
        </div>
        <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 border border-border/50 text-[11px] text-muted-foreground">
          <AlertCircle className="size-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            Apple requires PWAs to be installed on the Home Screen before allowing web push notifications. Tap the Share button in Safari, then select &ldquo;Add to Home Screen&rdquo;.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3.5 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5 pr-4">
          <Label
            htmlFor="push-toggle"
            className="text-xs font-medium text-foreground cursor-pointer"
          >
            Push notifications (this device)
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Receive instant reminders for upcoming deadlines and overdue tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          <Switch
            id="push-toggle"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={loading || permission === "denied"}
          />
        </div>
      </div>

      {permission === "denied" && (
        <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-[11px] text-destructive">
          Notifications are blocked in your browser settings. To enable them, click the lock icon in your browser address bar and allow Notifications.
        </div>
      )}

      {isSubscribed && (
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Device registered for Web Push
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSendTest}
            disabled={testing}
            className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            {testing ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Send className="size-3" />
            )}
            <span>Send test</span>
          </Button>
        </div>
      )}
    </div>
  );
}
