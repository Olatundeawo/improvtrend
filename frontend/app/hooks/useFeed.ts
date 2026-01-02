import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Story } from "../components/type";

export type FeedTabValue = "trending" | "newest";

export default function useFeed() {
  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTabValue>("trending");
  const router = useRouter()

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

  
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchStories(true);
  }, [activeTab]);

  
  useEffect(() => {
    fetchStories(true);
  }, []);

  
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
    router.push(`(tabs)/story?id=${id}`)
    console.log(id)
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

