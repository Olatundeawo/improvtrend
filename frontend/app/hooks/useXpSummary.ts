import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../util/api";
import axios from "axios";
import { useAuth } from "../context/auth";

interface XpBreakdownItem {
  reason: string;
  _sum: { finalXp: number };
  _count: { id: number };
}

interface XpSummary {
  totalXp: number;
  streak: number;
  multiplier: number;
  badge: string | null;
  breakdown: XpBreakdownItem[];
}

export default function useXpSummary(userId: string | undefined) {
  const [xpData, setXpData] = useState<XpSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const URL = process.env.EXPO_PUBLIC_BASE_URL;
  const { user } = useAuth();
  const fetchXpSummary = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
        const res = await axios.get(`${URL}xp/${userId}/summary`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
       setXpData(res.data.data);

       console.log("XP Summary fetched:", res.data.data);
    
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      console.error("useXpSummary:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchXpSummary();
  }, [fetchXpSummary]);

  return { xpData, loading, error, refetch: fetchXpSummary };
}