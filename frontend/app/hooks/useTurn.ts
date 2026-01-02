import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useState } from 'react'

export default function useTurn() {
  const { id } = useLocalSearchParams();
  const URL = process.env.EXPO_PUBLIC_BASE_URL;
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const createTurn = async (
    characterId: string,
    content: string
  ) => {
    setError(nul)
    setMessage(null)
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.log("Register to contribute");
      return null;
    }
    console.log(token)
    try {
      const res = await axios.post(
        `${URL}${id}/turns/`,
        { characterId, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 201) {
        setMessage("Successfuly added your contribution.")
      }
    } catch (err: any) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.error ||
            "Something went wrong"
          );
        } else {
          setError("Network error, check your internet connection");
        }
        return null;
      }
  };

  return { createTurn, error };
}
