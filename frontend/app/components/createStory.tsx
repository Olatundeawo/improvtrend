import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

const IS_WEB = Platform.OS === "web";

type Data = {
  title: string;
  characters: string;
  content: string;
};

export default function CreateStory() {
  const router = useRouter();
  const URL = process.env.EXPO_PUBLIC_BASE_URL;

  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<Data>({
    title: "",
    characters: "",
    content: "",
  });

  const [errors, setErrors] = useState<Partial<Data>>({});
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

 
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  function handleChange<K extends keyof Data>(field: K, value: Data[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function onClose() {
    setVisible(false);
    router.replace("/");
  }

  function validate() {
    const nextErrors: Partial<Data> = {};
    if (!data.title.trim()) nextErrors.title = "Title is required";
    if (!data.characters.trim())
      nextErrors.characters = "At least one character is required";
    if (!data.content.trim()) nextErrors.content = "Story content is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit() {
    if (!validate()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${URL}stories`,
        {
          title: data.title.trim(),
          characters: data.characters.trim(),
          content: data.content.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setData({ title: "", characters: "", content: "" });
      setFeedback({
        type: "success",
        text: "Story created successfully",
      });

      router.replace("/")

      onClose();
    } catch (err: any) {
        if (axios.isAxiosError(err)) {
            setFeedback({
                type: "error",
                text: err.response?.data.error || "Network error, check your internet connection",
              });
          } 
          
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* OVERLAY */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* MODAL */}
        <TouchableWithoutFeedback>
          <View style={styles.modal}>
          {feedback && (
              <View
                style={[
                  styles.feedback,
                  feedback.type === "error"
                    ? styles.feedbackError
                    : styles.feedbackSuccess,
                ]}
              >
                <Text style={styles.feedbackText}>{feedback.text}</Text>
              </View>
            )}

            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Create New Story</Text>

              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={10}
              >
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* TITLE */}
              <View style={styles.field}>
                <Text style={styles.label}>Story Title</Text>
                <TextInput
                  value={data.title}
                  onChangeText={(v) => handleChange("title", v)}
                  placeholder="Enter story title"
                  style={[
                    styles.input,
                    errors.title && styles.inputError,
                  ]}
                />
                {errors.title && (
                  <Text style={styles.error}>{errors.title}</Text>
                )}
              </View>

              {/* CHARACTERS */}
              <View style={styles.field}>
                <Text style={styles.label}>Characters</Text>
                <TextInput
                  value={data.characters}
                  onChangeText={(v) =>
                    handleChange("characters", v)
                  }
                  placeholder="e.g. John, Sarah, The Stranger"
                  style={[
                    styles.input,
                    errors.characters && styles.inputError,
                  ]}
                />
                {errors.characters && (
                  <Text style={styles.error}>
                    {errors.characters}
                  </Text>
                )}
                <Text style={styles.hint}>
                  Separate characters with commas
                </Text>
              </View>

              {/* CONTENT */}
              <View style={styles.field}>
                <Text style={styles.label}>Story Content</Text>
                <TextInput
                  value={data.content}
                  onChangeText={(v) => handleChange("content", v)}
                  placeholder="Write your story..."
                  multiline
                  style={[
                    styles.textarea,
                    errors.content && styles.inputError,
                  ]}
                />
                {errors.content && (
                  <Text style={styles.error}>{errors.content}</Text>
                )}
              </View>

              {/* ACTIONS */}
              <View style={styles.actions}>
                <Pressable
                  onPress={onClose}
                  style={styles.cancelButton}
                  disabled={loading}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={submit}
                  disabled={loading}
                  style={[
                    styles.submitButton,
                    loading && styles.submitDisabled,
                  ]}
                >
                  <Text style={styles.submitText}>
                    {loading ? "Creating..." : "Create Story"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "center",
    padding: 16,
  },

  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    maxHeight: "90%",
    width: "100%",
    ...(IS_WEB && {
      maxWidth: 560,
      alignSelf: "center",
    }),
  },

  feedback: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 12,
  },

  feedbackError: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  feedbackSuccess: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  feedbackText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  closeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
  },

  scrollContent: {
    paddingBottom: 8,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },

  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },

  textarea: {
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 14,
    fontSize: 15,
    textAlignVertical: "top",
  },

  inputError: {
    borderColor: "#EF4444",
  },

  error: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },

  hint: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 14,
    marginTop: 8,
  },

  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },

  submitButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#2563EB",
  },

  submitDisabled: {
    backgroundColor: "#94A3B8",
  },

  submitText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
