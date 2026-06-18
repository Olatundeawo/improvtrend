import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import type { ArcSize, ArcStage, StoryStatus } from "../components/type";

export type StoryDetail = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isLocked: boolean;
  userId: string;

  // arc
  arcSize:   ArcSize;
  arcStage:  ArcStage;
  maxTurns:  number;
  turnCount: number;
  status:    StoryStatus;
  voteCount: number;

  user:       { username: string; badge?: string };
  characters: { id: number; name: string; claimedByUserId: string | null; claimedBy?: { username: string } }[];
  turns:      { id: string; content: string; createdAt: string; character: { name: string }; user: { username: string } }[];
  comments:   { id: string; content: string; createdAt: string; user: { username: string } }[];
  totalReactions: number;
  commentCount:   number;
};

export type VoteResult = {
  voted: boolean;
  totalVotes: number;
  quorum: number;
  participantCount: number;
  completed: boolean;
};

export default function useStoryId() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const URL = process.env.EXPO_PUBLIC_BASE_URL;

  const [story, setStory]   = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  // action states
  const [completing, setCompleting]   = useState(false);
  const [voting, setVoting]           = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMsg, setActionMsg]     = useState<string | null>(null);

  const getStory = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${URL}stories/${id}`);
      setStory(res.data);
    } catch {
      setError("Unable to load story. Check your internet connection.");
      setStory(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { getStory(); }, [getStory]);

  // ── creator ends story ────────────────────────────────────────────────────
  async function completeStory() {
    if (!id) return;
    setCompleting(true);
    setActionError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${URL}stories/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg("Story marked as complete.");
      await getStory();
    } catch (err: any) {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.error ?? "Could not complete story."
          : "Could not complete story."
      );
    } finally {
      setCompleting(false);
    }
  }

  // ── community vote ────────────────────────────────────────────────────────
  async function voteToComplete(): Promise<VoteResult | null> {
    if (!id) return null;
    setVoting(true);
    setActionError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post<VoteResult>(
        `${URL}stories/${id}/vote-complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = res.data;
      if (result.completed) {
        setActionMsg("The community voted to complete this story!");
        await getStory();
      } else {
        setActionMsg(
          `Vote recorded — ${result.totalVotes}/${result.quorum} needed to close.`
        );
        // update local vote count without a full refetch
        setStory((prev) =>
          prev ? { ...prev, voteCount: result.totalVotes } : prev
        );
      }
      return result;
    } catch (err: any) {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.error ?? "Could not cast vote."
          : "Could not cast vote."
      );
      return null;
    } finally {
      setVoting(false);
    }
  }

  return {
    story,
    loading,
    error,
    retry: getStory,

    completeStory,
    completing,
    voteToComplete,
    voting,
    actionError,
    actionMsg,
    clearActionMsg: () => setActionMsg(null),
    clearActionError: () => setActionError(null),
  };
}