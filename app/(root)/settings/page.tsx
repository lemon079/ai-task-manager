"use client";

import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings, Settings } from "@/hooks/useSettings";
import { toast } from "sonner";
import CustomLoader from "@/components/shared/CustomLoader";
import { DateTime } from "luxon";
import { useTheme } from "next-themes";
import PushNotificationToggle from "@/components/settings/PushNotificationToggle";
import { Bell, X } from "lucide-react";

function SettingsForm({
  initialSettings,
  saveSettings,
  isPending,
}: {
  initialSettings: Settings;
  saveSettings: any;
  isPending: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const defaultZone = useMemo(
    () => initialSettings.timeZone || DateTime.local().zoneName || "UTC",
    [initialSettings.timeZone]
  );
  const defaultTime = initialSettings.notificationTime || "09:00";
  const defaultEnabled = initialSettings.notificationsEnabled ?? true;
  const defaultShowTitles = initialSettings.showTaskTitles ?? true;

  const [notificationsEnabled, setNotificationsEnabled] = useState(defaultEnabled);
  const [notificationTime, setNotificationTime] = useState(defaultTime);
  const [timeZone, setTimeZone] = useState(defaultZone);
  const [showTaskTitles, setShowTaskTitles] = useState(defaultShowTitles);

  const [emailNoticeDismissed, setEmailNoticeDismissed] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("neuratask-email-notice-dismissed");
      setEmailNoticeDismissed(dismissed === "true");
    }
  }, []);

  const handleDismissNotice = () => {
    setEmailNoticeDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("neuratask-email-notice-dismissed", "true");
    }
  };

  const [savedSettings, setSavedSettings] = useState({
    notificationsEnabled: defaultEnabled,
    notificationTime: defaultTime,
    timeZone: defaultZone,
    showTaskTitles: defaultShowTitles,
  });

  const handleSave = () => {
    saveSettings(
      { notificationsEnabled, notificationTime, timeZone, showTaskTitles },
      {
        onSuccess: () => {
          toast.success("Settings saved");
          setSavedSettings({ notificationsEnabled, notificationTime, timeZone, showTaskTitles });
        },
        onError: () => {
          toast.error("Failed to save settings");
        },
      }
    );
  };

  const isChanged = useMemo(() => {
    return (
      notificationsEnabled !== savedSettings.notificationsEnabled ||
      notificationTime !== savedSettings.notificationTime ||
      timeZone !== savedSettings.timeZone ||
      showTaskTitles !== savedSettings.showTaskTitles
    );
  }, [notificationsEnabled, notificationTime, timeZone, showTaskTitles, savedSettings]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your notifications and preferences
        </p>
      </div>

      {/* Dismissible Notice: Email replaced by Push */}
      {!emailNoticeDismissed && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary shrink-0" />
            <span>
              Email reminders have been replaced by Web Push notifications. Turn them on below to stay updated.
            </span>
          </div>
          <button
            onClick={handleDismissNotice}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-sm cursor-pointer"
            aria-label="Dismiss notice"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Flat Notion-style settings list */}
      <div className="rounded-md border border-border bg-card divide-y divide-border/60">
        {/* Row: Dark Mode */}
        <div className="flex items-center justify-between p-3.5 sm:p-4">
          <div className="space-y-0.5 pr-4">
            <Label htmlFor="theme-toggle" className="text-xs font-medium text-foreground cursor-pointer">
              Dark mode
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Toggle between light and dark appearance
            </p>
          </div>
          <Switch
            id="theme-toggle"
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>

        {/* Row: Web Push Notifications (PWA) */}
        <PushNotificationToggle />

        {/* Row: Notification Privacy (Show task titles) */}
        <div className="flex items-center justify-between p-3.5 sm:p-4">
          <div className="space-y-0.5 pr-4">
            <Label htmlFor="privacy-toggle" className="text-xs font-medium text-foreground cursor-pointer">
              Show task titles in notifications
            </Label>
            <p className="text-[11px] text-muted-foreground">
              When turned off, notification messages show generic text without revealing sensitive task titles
            </p>
          </div>
          <Switch
            id="privacy-toggle"
            checked={showTaskTitles}
            onCheckedChange={setShowTaskTitles}
          />
        </div>

        {/* Row: Morning Task Digest */}
        <div className="flex items-center justify-between p-3.5 sm:p-4">
          <div className="space-y-0.5 pr-4">
            <Label htmlFor="notifications-toggle" className="text-xs font-medium text-foreground cursor-pointer">
              Morning task digest
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Receive a morning push summary when multiple tasks are scheduled for the day
            </p>
          </div>
          <Switch
            id="notifications-toggle"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </div>

        {/* Row: Notification Time */}
        {notificationsEnabled && (
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <div className="space-y-0.5 pr-4">
              <Label htmlFor="time-input" className="text-xs font-medium text-foreground">
                Digest time
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Local time when morning briefing is dispatched
              </p>
            </div>
            <Input
              id="time-input"
              type="time"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              className="w-28 h-7 text-xs rounded-md border-border bg-background"
            />
          </div>
        )}

        {/* Row: Timezone */}
        <div className="flex items-center justify-between p-3.5 sm:p-4">
          <div className="space-y-0.5 pr-4">
            <span className="text-xs font-medium text-foreground block">
              Timezone
            </span>
            <p className="text-[11px] text-muted-foreground">
              Used for deadline calculations and notifications
            </p>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums font-mono">
            {timeZone}
          </span>
        </div>
      </div>

      {/* Save Action */}
      <div className="flex justify-end pt-1">
        <Button
          size="sm"
          className="h-7 px-3 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          onClick={handleSave}
          disabled={!isChanged || isPending}
        >
          {isPending ? <CustomLoader color="text-white" /> : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, isLoading, saveSettings, isPending } = useSettings();

  if (isLoading || !settings) return <CustomLoader fullScreen />;

  return (
    <SettingsForm
      initialSettings={settings}
      saveSettings={saveSettings}
      isPending={isPending}
    />
  );
}
