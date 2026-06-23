import axios from "axios";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useAuth } from "../context/auth";

const URL = process.env.EXPO_PUBLIC_BASE_URL;
const BIO_MAX = 280;

export default function useEditProfile() {
  const { user, updateUser } = useAuth();
  

  const [bio, setBio]             = useState(user?.bio ?? "");
  const [genres, setGenres]       = useState<string[]>(user?.genrePreferences ?? []);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to change your avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const toggleGenre = (key: string) => {
    setGenres((prev) =>
      prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
    );
  };

  const saveProfile = async (): Promise<boolean> => {
    const trimmedBio = bio.trim();

    if (trimmedBio.length > BIO_MAX) {
      Alert.alert("Bio too long", `Keep it under ${BIO_MAX} characters.`);
      return false;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append("bio", trimmedBio);
      form.append("genrePreferences", JSON.stringify(genres));

      if (avatarUri) {
        const filename = avatarUri.split("/").pop() ?? "avatar.jpg";
        const ext      = filename.split(".").pop() ?? "jpg";
        form.append("avatar", {
          uri:  avatarUri,
          name: filename,
          type: `image/${ext === "jpg" ? "jpeg" : ext}`,
        } as any);
      }

      const res = await axios.patch(`${URL}users/me`, form, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await updateUser({
        bio:              res.data.bio,
        avatarUrl:        res.data.avatarUrl,
        genrePreferences: res.data.genrePreferences,
      });

      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Something went wrong. Please try again.";
      Alert.alert("Save failed", message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    
    bio,
    genres,
    avatarUri,
    saving,
    
    displayAvatar: avatarUri ?? user?.avatarUrl ?? null,
    bioLength: bio.trim().length,
    
    setBio,
    toggleGenre,
    pickAvatar,
    saveProfile,
  };
}