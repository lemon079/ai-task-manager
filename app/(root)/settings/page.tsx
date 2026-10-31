"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import CustomLoader from "@/components/shared/CustomLoader";
import { DateTime } from "luxon";
import { Bell, Moon, Sun, Monitor, Palette, Sparkles, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

function ThemePreferencesCard() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "light", label: "Light", icon: Sun, desc: "Crisp daytime contrast" },
    { id: "dark", label: "Dark", icon: Moon, desc: "Sleek eye-friendly mode" },
    { id: "system", label: "System", icon: Monitor, desc: "Sync with OS theme" },
  ];

  return (
    <Card className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Palette className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold">
              Appearance & Theme
            </CardTitle>
            <CardDescription className="text-xs">
              Customize how NeuraTask looks across your devices
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            const Icon = t.icon;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  "relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                    : "border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  {isSelected && (
                    <span className="size-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {t.label}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {t.desc}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

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
          toast.success("Settings saved successfully");
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
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Settings
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border">
            Preferences
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Configure notifications, themes, and workspace synchronization
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <ThemePreferencesCard />

        {/* Notification Preferences Card */}
        <Card className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  Daily Task Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Active Timezone: {timeZone}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Daily Notification Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/40 hover:bg-muted/60 border border-border/40 transition-colors">
              <div className="flex-1">
                <Label htmlFor="notifications" className="text-sm font-semibold cursor-pointer">
                  Enable Daily Summary Email
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receive a morning briefing with your pending tasks and deadlines
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {/* Notification Time */}
            {notificationsEnabled && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex-1">
                  <Label htmlFor="notification-time" className="text-sm font-semibold">
                    Delivery Schedule
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select the local time you prefer to receive the digest
                  </p>
                </div>
                <Input
                  id="notification-time"
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="w-full sm:w-36 h-9 rounded-lg"
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                className="w-full sm:w-auto h-10 px-6 rounded-xl font-medium gap-2 shadow-sm shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-95"
                onClick={handleSave}
                disabled={!isChanged || isPending}
              >
                {isPending ? (
                  <CustomLoader color="text-white" />
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>Save Preferences</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
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
