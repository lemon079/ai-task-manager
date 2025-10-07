"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import CustomLoader from "@/components/shared/CustomLoader";

const Page = () => {
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


  useEffect(() => {
    const detectedZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(detectedZone);
  }, []);


  useEffect(() => {
    if (settings) {
      const { notificationsEnabled, notificationTime, timeZone } = settings;
      const detectedZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
    <div className="min-h-screen bg-muted/30 sm:px-8 lg:px-16">
      <div className="grid gap-8 w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
            <CardDescription className="text-xs">
              Timezone: {timeZone}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Toggle Notifications */}
            <div className="flex items-center justify-between">
              <Label
                htmlFor="notifications"
                className="text-base font-normal"
              >
                Enable Notifications
              </Label>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {/* Notification Time */}
            {notificationsEnabled && (
              <div className="flex justify-between">
                <Label
                  htmlFor="notification-time"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Notify Me Everyday At
                </Label>
                <Input
                  id="notification-time"
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="w-fit"
                />
              </div>
            )}

            <Button
              variant={"customBlue"}
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={!isChanged || isPending}
            >
              {isPending ? <CustomLoader color="text-black" /> : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
