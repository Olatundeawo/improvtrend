import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";

export default function useTurn() {
  const { id } = useLocalSearchParams();
  const URL = process.env.EXPO_PUBLIC_BASE_URL;

  const createTurn = async (
    characterId: string,
    content: string
  ) => {
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
        return res.data; 
      }
    } catch (err) {
      console.log("Error creating turn", err);
    }

    return null;
  };

  return { createTurn };
}
