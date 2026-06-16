import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/auth";
import { Story } from "../components/type";

export default function useUserStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const URL = process.env.EXPO_PUBLIC_BASE_URL;

  const fetchStories = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${URL}stories/user/${user.id}/`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

    
      const raw = res.data?.data?.stories ?? [];
      setStories(Array.isArray(raw) ? raw : []);
    
    } catch (e: any) {
      console.error("Fetch user stories failed", e);
      setError(e?.message ?? "Something went wrong");
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [user?.id]);

  return {
    stories,
    loading,
    error,
    refetch: fetchStories,
  };
}