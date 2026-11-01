import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface CalendarData {
  calendar: Record<string, any[]>;
  tasks: any[];
  metrics: {
    total: number;
    today: number;
    upcoming: number;
    overdue: number;
    unscheduled: number;
  };
}

const useCalendar = () => {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/calendar");
      setData(response.data?.data ?? response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return { data, loading, error, refetch: fetchCalendar };
};

export default useCalendar;
