import { useState, useEffect } from "react";
import axios from "axios";

const useCalendar = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/calendar");
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []); // run once on mount

  return { data, loading, error };
};

export default useCalendar;
