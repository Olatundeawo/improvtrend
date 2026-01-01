import AsyncStorage from "@react-native-async-storage/async-storage";


export async function toggleUpvote(turnId: string) {
    const URL = process.env.EXPO_PUBLIC_BASE_URL;

    const token = await AsyncStorage.getItem("token");
    const res = await fetch(
      `${URL}turns/${turnId}/upvote/`,
      {
        method: "POST",
         
        headers: {
            Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  
    if (!res.ok) {
      throw new Error("Failed to toggle upvote");
    }
  
    return res.json();
  }
  