"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import CustomLoader from "@/components/shared/CustomLoader";
import { DateTime } from "luxon";
import { useTheme } from "next-themes";

function SettingsForm({
  initialSettings,
  saveSettings,
  isPending,
}: {
  initialSettings: {
    notificationsEnabled: boolean;
    notificationTime?: string;
    timeZone?: string;
  };
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

  const [notificationsEnabled, setNotificationsEnabled] = useState(defaultEnabled);
  const [notificationTime, setNotificationTime] = useState(defaultTime);
  const [timeZone, setTimeZone] = useState(defaultZone);

  const [savedSettings, setSavedSettings] = useState({
    notificationsEnabled: defaultEnabled,
    notificationTime: defaultTime,
    timeZone: defaultZone,
  });

  const handleSave = () => {
    saveSettings(
      { notificationsEnabled, notificationTime, timeZone },
      {
        onSuccess: () => {
          toast.success("Settings saved");
          setSavedSettings({ notificationsEnabled, notificationTime, timeZone });
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
      timeZone !== savedSettings.timeZone
    );
  }, [notificationsEnabled, notificationTime, timeZone, savedSettings]);

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

        {/* Row: Daily Task Summary */}
        <div className="flex items-center justify-between p-3.5 sm:p-4">
          <div className="space-y-0.5 pr-4">
            <Label htmlFor="notifications-toggle" className="text-xs font-medium text-foreground cursor-pointer">
              Daily task summary
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Receive a morning digest email with pending tasks and deadlines
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
                Delivery time
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Local time when daily briefing is dispatched
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
