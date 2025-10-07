import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Settings {
  notificationsEnabled: boolean;
  notificationTime: string;
  timeZone: string;
}

// Fetch user settings
async function fetchSettings(): Promise<Settings> {
  const { data } = await axios.get("/api/settings");
  return data;
}

// Update user settings
async function updateSettings(data: Settings) {
  const res = await axios.post("/api/settings", data);
  return res.data;
}

export function useSettings() {
  const queryClient = useQueryClient();

  // Fetch settings from DB
  const {
    data: settings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userSettings"],
    queryFn: fetchSettings,
  });

  // Mutation to save settings
  const {
    mutate: saveSettings,
    isPending,
    isError: isSaveError,
    error: saveError,
  } = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
  });

  return {
    settings,
    isLoading,
    isError,
    error,
    saveSettings,
    isPending,
    isSaveError,
    saveError,
  };
}
