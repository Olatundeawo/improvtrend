import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface XpBreakdownItem {
  reason: string;
  _sum:   { finalXp: number };
  _count: { id: number };
}

interface BadgeRecord {
  badge:     string;
  awardedAt: string;
}

interface LevelMeta {
  title:   string;
  message: string;
}

interface BadgeMeta {
  title:   string;
  message: string;
}

export interface XpSummary {
  totalXp:     number;
  streak:      number;
  multiplier:  number;

  // Badge
  badge:     string | null;   // latest badge key e.g. "CONTRIBUTOR"
  badgeMeta: BadgeMeta | null;
  badges:    BadgeRecord[];   // all earned badges

  // Level
  level:       string;        // e.g. "SCRIBE"
  levelMeta:   LevelMeta;
  nextLevel:   string | null;
  xpToNext:    number | null;
  progressPct: number;        // 0–100

  breakdown: XpBreakdownItem[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useXpSummary(userId: string | undefined) {
  const [xpData,  setXpData]  = useState<XpSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const URL        = process.env.EXPO_PUBLIC_BASE_URL;
  const { user }   = useAuth();

  const fetchXpSummary = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${URL}xp/${userId}/summary`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setXpData(res.data.data);
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