import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

export default function useStoryId() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const URL = process.env.EXPO_PUBLIC_BASE_URL;

  const getStory = async () => {
    try {
      const res = await axios.get(`${URL}stories/${id}`);
      setStory(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!id) return;

    getStory();
  }, [id]);

  return { story, loading, retry:getStory };
}
