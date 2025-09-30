"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("09:00");

  const handleSave = () => {
    // In production, persist to API or localStorage
    console.log("Settings saved:", {
      notificationsEnabled,
      notificationTime,
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-6 sm:px-8 lg:px-16">
      {/* Page header */}
      <h1 className="text-3xl font-semibold tracking-tight mb-8">
        Settings
      </h1>

      <div className="grid gap-8 w-full">
        {/* Notification Settings Section */}
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

            <Button className="w-full sm:w-auto" onClick={handleSave}>
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
