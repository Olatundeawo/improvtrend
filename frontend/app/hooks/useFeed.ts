import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Story } from "../components/type";

export type FeedTabValue = "trending" | "newest";

export default function useFeed() {
  const router = useRouter();
  const URL = process.env.EXPO_PUBLIC_BASE_URL;

  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);      
  const [refreshing, setRefreshing] = useState(false); 

  const [activeTab, setActiveTab] = useState<FeedTabValue>("trending");

  
  const fetchStories = async (reset = false) => {
    // Prevent double calls
    if ((loading || refreshing) && !reset) return;
    if (!hasMore && !reset) return;

    reset ? setRefreshing(true) : setLoading(true);

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

      setHasMore(pagination?.hasMore ?? false);
      setPage(reset ? 2 : page + 1);
    } catch (err) {
      console.error("Fetch stories error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 
  const refreshFeed = async () => {
    setHasMore(true);
    setPage(1);
    await fetchStories(true);
  };

 
  useEffect(() => {
    refreshFeed();
  }, [activeTab]);

  
  useEffect(() => {
    refreshFeed();
  }, []);

  
  const filteredStories = useMemo(() => {
    if (activeTab === "trending") {
      return [...stories].sort(
        (a, b) => b.turns.length - a.turns.length
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
    router.push(`(tabs)/story?id=${id}`);
  };

  return {
    stories: filteredStories,
    activeTab,
    setActiveTab,

    loadMore: fetchStories,   
    refreshFeed,              

    loading,
    refreshing,
    hasMore,

    handleStoryId,
  };
}
