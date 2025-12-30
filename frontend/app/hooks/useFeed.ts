import axios from "axios";
import { useEffect, useMemo, useState } from "react";

export type FeedTabValue = "trending" | "newest" | "following";

type Story = {
  id: string;
  title: string;
  content: string;
  isLocked: boolean;
  createdAt: string;
  username: string;
  characters: { id: string; name: string }[];
  turns: any[];
  comments: { id: string }[];
};

export default function useFeed() {
  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTabValue>("trending");

  const URL = process.env.EXPO_PUBLIC_BASE_URL;

  const fetchStories = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);

    try {
      const res = await axios.get(`${URL}stories`, {
        params: {
          page: reset ? 1 : page,
          limit: 10,
        },
      });

      const { data, pagination } = res.data;

      setStories((prev) =>
        reset ? data : [...prev, ...data]
      );

      setHasMore(pagination.hasMore);
      setPage(reset ? 2 : page + 1);
    } catch (err) {
      console.error("Fetch stories error:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Reset pagination when tab changes */
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchStories(true);
  }, [activeTab]);

  /** Initial fetch */
  useEffect(() => {
    fetchStories(true);
  }, []);

  /** Apply tab logic AFTER pagination */
  const filteredStories = useMemo(() => {
    switch (activeTab) {
      case "trending":
        return [...stories].sort(
          (a, b) => b.turns.length - a.turns.length
        );

      case "newest":
        return [...stories].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      default:
        return stories;
    }
  }, [stories, activeTab]);

  const handleStoryId = (id: string) => {
    console.log("Story pressed:", id);
  };

  return {
    stories: filteredStories,
    activeTab,
    setActiveTab,
    loadMore: fetchStories,
    loading,
    hasMore,
    handleStoryId,
  };
}

