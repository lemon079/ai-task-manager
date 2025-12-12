"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import CustomLoader from "@/components/shared/CustomLoader";
import { DateTime } from "luxon";
import { Bell } from "lucide-react";

export default function SettingsPage() {
  const { settings, isLoading, saveSettings, isPending } = useSettings();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("08:00");
  const [timeZone, setTimeZone] = useState("");

  // Store initial values for comparison
  const [initialSettings, setInitialSettings] = useState<{
    notificationsEnabled: boolean;
    notificationTime: string;
    timeZone: string;
  } | null>(null);

  // Detect timezone using Luxon
  useEffect(() => {
    const detectedZone = DateTime.local().zoneName;
    setTimeZone(detectedZone);
  }, []);

  useEffect(() => {
    if (settings) {
      const { notificationsEnabled, notificationTime, timeZone } = settings;
      const detectedZone = DateTime.local().zoneName;

      setNotificationsEnabled(notificationsEnabled);
      setNotificationTime(notificationTime || "09:00");
      setTimeZone(timeZone || detectedZone);

      setInitialSettings({
        notificationsEnabled,
        notificationTime: notificationTime || "09:00",
        timeZone: timeZone || detectedZone,
      });
    }
  }, [settings]);

  const handleSave = () => {
    saveSettings(
      { notificationsEnabled, notificationTime, timeZone },
      {
        onSuccess: () => {
          toast.success("Settings saved successfully");
          setInitialSettings({ notificationsEnabled, notificationTime, timeZone });
        },
        onError: () => {
          toast.error("Failed to save settings");
        },
      }
    );
  };

  const isChanged = useMemo(() => {
    if (!initialSettings) return false;
    return (
      notificationsEnabled !== initialSettings.notificationsEnabled ||
      notificationTime !== initialSettings.notificationTime ||
      timeZone !== initialSettings.timeZone
    );
  }, [notificationsEnabled, notificationTime, timeZone, initialSettings]);

  if (isLoading) return <CustomLoader fullScreen />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your notification preferences</p>
      </div>

      <div className="grid gap-6 max-w-6xl mx-auto">
        {/* Notification Preferences Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Daily Task Summary</CardTitle>
                <CardDescription>
                  Timezone: {timeZone}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Daily Notification Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex-1">
                <Label htmlFor="notifications" className="text-sm font-medium">Enable Daily Summary</Label>
                <p className="text-xs text-muted-foreground">Receive a daily email with your task summary</p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {/* Notification Time */}
            {notificationsEnabled && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex-1">
                  <Label htmlFor="notification-time" className="text-sm font-medium">Notify Me Daily At</Label>
                  <p className="text-xs text-muted-foreground">Choose your preferred time</p>
                </div>
                <Input
                  id="notification-time"
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="w-full sm:w-32"
                />
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={!isChanged || isPending}
            >
              {isPending ? <CustomLoader color="text-white" /> : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
