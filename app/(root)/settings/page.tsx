"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings"; // ← our React Query hook
import { toast } from "sonner";

const SettingsPage = () => {
  const { settings, isLoading, saveSettings, isPending } = useSettings();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("09:00");

  // When settings are fetched, sync them to local state
  useEffect(() => {
    if (settings) {
      setNotificationsEnabled(settings.notificationsEnabled);
      setNotificationTime(settings.notificationTime || "09:00");
    }
  }, [settings]);

  const handleSave = () => {
    saveSettings(
      { notificationsEnabled, notificationTime },
      {
        onSuccess: () => {
          toast.success("Settings saved successfully");
        },
        onError: () => {
          toast.error("Failed to save settings");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-6 sm:px-8 lg:px-16">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">
        Settings
      </h1>

      <div className="grid gap-8 w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-medium">
              Notifications
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Toggle Notifications */}
            <div className="flex items-center justify-between">
              <Label
                htmlFor="notifications"
                className="text-base font-normal text-muted-foreground"
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
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
