import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/auth";
import { Story } from "../components/type";

export default function useUserStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const URL = process.env.EXPO_PUBLIC_BASE_URL;

  const fetchStories = async () => {
    if (!user) return;


    setLoading(true);
    try {
      const res = await axios.get(`${URL}stories/user/${user.id}/`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setStories(res.data.data);
    } catch (e) {
      console.error("Fetch user stories failed", e);
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
    refetch: fetchStories,
  };
}
