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
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<FeedTabValue>("trending");

  const [newStories, setNewStories] = useState<Story[]>([]);
  const [showNewStoriesBanner, setShowNewStoriesBanner] = useState<boolean>(false);

  const newestStoryTimeRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null)

  const didInitialLoad = useRef<boolean>(false);

  
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

      newestStoryTimeRef.current = data[0]?.createdAt ?? null;
      setNewStories([]);
      setShowNewStoriesBanner(false);
    } catch (err) {
      setError("unable to refresh")
    } finally {
      setRefreshing(false);
    }
  };

  const checkForNewStories = async () => {
    if (!newestStoryTimeRef.current) return;

    try {
      const res = await axios.get(`${URL}stories`, {
        params: {
          page: 1,
          limit: LIMIT,
        },
      });

      const incoming = res.data.data as Story[];

      const newer = incoming.filter(
        (s) =>
          new Date(s.createdAt).getTime() >
          new Date(newestStoryTimeRef.current!).getTime()
      );

      if (newer.length > 0) {
        setNewStories(newer);
        setShowNewStoriesBanner(true);
      }
    } catch (e) {
      setError("Your connection is weak")
    }
  };

  const applyNewStories = () => {
    setStories((prev) => [...newStories, ...prev]);
    newestStoryTimeRef.current = newStories[0]?.createdAt ?? null;
    setNewStories([]);
    setShowNewStoriesBanner(false);
  };



  useEffect(() => {
    didInitialLoad.current = false;
    refreshFeed();
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(checkForNewStories, 20000); 
    return () => clearInterval(interval);
  }, []);

 
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
    error

    showNewStoriesBanner,
    newStoriesCount: newStories.length,
    applyNewStories,

    handleStoryId,
  };
}
