import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Story } from "../components/type";

export type FeedTabValue = "trending" | "newest";

const LIMIT = 2;

export default function useFeed() {
  const router = useRouter();
  const URL = process.env.EXPO_PUBLIC_BASE_URL;

  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<FeedTabValue>("trending");

  const didInitialLoad = useRef(false);

  
  const fetchMore = async () => {
    if (loading || refreshing || !hasMore) return;

    setLoading(true);
    try {
      const res = await axios.get(`${URL}stories`, {
        params: {
          page,
          limit: LIMIT,
        },
      });

      const { data, pagination } = res.data;

      setStories((prev) => [...prev, ...data]);
      setHasMore(pagination?.hasMore ?? false);
      setPage((p) => p + 1);
    } catch (err) {
      console.error("Fetch more error:", err);
    } finally {
      setLoading(false);
    }
  };

  
  const refreshFeed = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      const res = await axios.get(`${URL}stories`, {
        params: {
          page: 1,
          limit: LIMIT,
        },
      });

      const { data, pagination } = res.data;

      setStories(data);
      setHasMore(pagination?.hasMore ?? false);
      setPage(2);
    } catch (err) {
      console.error("Refresh feed error:", err);
    } finally {
      setRefreshing(false);
    }
  };


  useEffect(() => {
    didInitialLoad.current = false;
    refreshFeed();
  }, [activeTab]);

 
  const sortedStories = useMemo(() => {
    if (activeTab === "trending") {
      return [...stories].sort(
        (a, b) => (b.turns?.length ?? 0) - (a.turns?.length ?? 0)
      );
    }

    if (activeTab === "newest") {
      return [...stories].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    return stories;
  }, [stories, activeTab]);

  
  const handleStoryId = (id: string) => {
    router.push(`components/StoryId?id=${id}`);
  };

  return {
    stories: sortedStories,
    activeTab,
    setActiveTab,

    fetchMore,
    refreshFeed,

    loading,
    refreshing,
    hasMore,

    handleStoryId,
  };
}
