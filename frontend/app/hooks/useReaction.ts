import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export type ReactionType = "SPICY" | "PLOT_TWIST" | "FUNNY" | "BEST_LINE";

export type ReactionSummary = {
  type: ReactionType;
  count: number;
  reacted: boolean;
};

export const REACTION_META: Record<ReactionType, { emoji: string; label: string }> = {
  SPICY:      { emoji: "🌶️", label: "Spicy"      },
  PLOT_TWIST: { emoji: "🌀", label: "Twist"      },
  FUNNY:      { emoji: "😂", label: "Funny"      },
  BEST_LINE:  { emoji: "⭐", label: "Best"       },
};

async function authHeaders() {
  const token = await AsyncStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function toggleReaction(
  turnId: string,
  type: ReactionType
): Promise<{ reacted: boolean; type: ReactionType; summary: ReactionSummary[] }> {
  const res = await fetch(`${BASE_URL}reactions/turns/${turnId}`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ type }),
  });

  if (!res.ok) throw new Error("Failed to toggle reaction");
  return res.json();
}

export async function getReactions(turnId: string): Promise<ReactionSummary[]> {
  const res = await fetch(`${BASE_URL}reactions/turns/${turnId}`, {
    method: "GET",
    headers: await authHeaders(),
  });

  console.log("getReactions response:", res);

  if (!res.ok) throw new Error("Failed to fetch reactions");
  const data = await res.json();
  return data.summary;
}

export async function getBulkReactions(
  turnIds: string[]
): Promise<Record<string, ReactionSummary[]>> {
  const res = await fetch(`${BASE_URL}reactions/bulk`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ turnIds }),
  });

  if (!res.ok) throw new Error("Failed to fetch bulk reactions");
  const data = await res.json();
  return data.summary;
}