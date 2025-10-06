"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import CustomLoader from "@/components/shared/CustomLoader";
import Heading from "@/components/shared/Heading";
import { Bell } from "lucide-react";

const SettingsPage = () => {
  const { settings, isLoading, saveSettings, isPending } = useSettings();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("09:00");

  // Store initial values for comparison
  const [initialSettings, setInitialSettings] = useState<{
    notificationsEnabled: boolean;
    notificationTime: string;
  } | null>(null);

  useEffect(() => {
    if (settings) {
      const { notificationsEnabled, notificationTime } = settings;
      setNotificationsEnabled(notificationsEnabled);
      setNotificationTime(notificationTime || "09:00");
      setInitialSettings({
        notificationsEnabled,
        notificationTime: notificationTime || "09:00",
      });
    }
  }, [settings]);

  const handleSave = () => {
    saveSettings(
      { notificationsEnabled, notificationTime },
      {
        onSuccess: () => {
          toast.success("Settings saved successfully");
          // Update initial settings after successful save
          setInitialSettings({ notificationsEnabled, notificationTime });
        },
        onError: () => {
          toast.error("Failed to save settings");
        },
      }
    );
  };

  // Check if any field has changed
  const isChanged = useMemo(() => {
    if (!initialSettings) return false;
    return (
      notificationsEnabled !== initialSettings.notificationsEnabled ||
      notificationTime !== initialSettings.notificationTime
    );
  }, [notificationsEnabled, notificationTime, initialSettings]);

  if (isLoading) return <CustomLoader fullScreen />;

  return (
    <div className="min-h-screen bg-muted/30 sm:px-8 lg:px-16">
      <div className="grid gap-8 w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
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
              {isPending ? <CustomLoader color="text-black"/> : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
