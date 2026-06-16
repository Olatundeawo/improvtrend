import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export type Character = {
  id: number;
  name: string;
  claimedByUserId: string | null;
  claimedBy: { username: string } | null;
};

export default function useCharacter() {
  const { id: storyId } = useLocalSearchParams<{ id: string }>();
  const URL = process.env.EXPO_PUBLIC_BASE_URL;

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    if (!storyId) return;
    try {
      const res = await axios.get(`${URL}stories/${storyId}/characters`);
      setCharacters(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const addCharacter = async (name: string) => {
    setError(null);
    setMessage(null);
    const token = await AsyncStorage.getItem("token");
    if (!token) { setError("Login to add characters."); return false; }

    try {
      await axios.post(
        `${URL}stories/${storyId}/characters`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`"${name}" added.`);
      await fetchCharacters();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not add character.");
      return false;
    }
  };

  const claimCharacter = async (characterId: number) => {
    setError(null);
    setMessage(null);
    const token = await AsyncStorage.getItem("token");
    if (!token) { setError("Login to claim characters."); return false; }

    try {
      await axios.patch(
        `${URL}stories/${storyId}/characters/${characterId}/claim`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Character claimed!");
      await fetchCharacters();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not claim character.");
      return false;
    }
  };

  const unclaimCharacter = async (characterId: number) => {
    setError(null);
    setMessage(null);
    const token = await AsyncStorage.getItem("token");
    if (!token) { setError("Login required."); return false; }

    try {
      await axios.patch(
        `${URL}stories/${storyId}/characters/${characterId}/unclaim`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Character released.");
      await fetchCharacters();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not unclaim character.");
      return false;
    }
  };

  return {
    characters,
    loading,
    error,
    message,
    fetchCharacters,
    addCharacter,
    claimCharacter,
    unclaimCharacter,
  };
}