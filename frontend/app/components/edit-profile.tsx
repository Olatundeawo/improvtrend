import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useAuth } from "../context/auth";
import useEditProfile from "../hooks/Useeditprofile";


const ALL_GENRES = [
  { key: "COMEDY",        label: "😂 Comedy" },
  { key: "HORROR",        label: "👻 Horror" },
  { key: "ROMANCE",       label: "💕 Romance" },
  { key: "MYSTERY",       label: "🔍 Mystery" },
  { key: "FANTASY",       label: "🧙 Fantasy" },
  { key: "SCI_FI",        label: "🚀 Sci-Fi" },
  { key: "DRAMA",         label: "🎭 Drama" },
  { key: "ADVENTURE",     label: "⚔️ Adventure" },
  { key: "THRILLER",      label: "😰 Thriller" },
  { key: "SLICE_OF_LIFE", label: "☕ Slice of Life" },
];

const BIO_MAX = 280;


export default function EditProfile() {
  const { user }      = useAuth();
  const router        = useRouter();
  const { width }     = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const {
    bio, genres, saving,
    displayAvatar, bioLength,
    setBio, toggleGenre, pickAvatar, saveProfile,
  } = useEditProfile();

  const handleSave = async () => {
    const ok = await saveProfile();
    if (ok) router.back();
  };

  if (!user) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, isLargeScreen && styles.cardLarge]}>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} style={styles.avatarWrap}>
            {displayAvatar ? (
              <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.avatarOverlay}>
              <Text style={styles.avatarOverlayText}>Change</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* ── Username (read-only) ── */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Username</Text>
          <View style={styles.readonlyField}>
            <Text style={styles.readonlyText}>{user.username}</Text>
          </View>
          <Text style={styles.fieldHint}>Usernames can't be changed right now.</Text>
        </View>

        {/* ── Bio ── */}
        <View style={styles.field}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <Text style={[styles.charCount, bioLength > BIO_MAX && styles.charCountOver]}>
              {bioLength}/{BIO_MAX}
            </Text>
          </View>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell the community a bit about yourself…"
            placeholderTextColor="#cbd5e1"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* ── Genre preferences ── */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Genre preferences</Text>
          <Text style={styles.fieldHint}>Pick genres you enjoy writing or reading.</Text>
          <View style={styles.genreGrid}>
            {ALL_GENRES.map(({ key, label }) => {
              const selected = genres.includes(key);
              return (
                <Pressable
                  key={key}
                  onPress={() => toggleGenre(key)}
                  style={[styles.genreChip, selected && styles.genreChipSelected]}
                >
                  <Text style={[styles.genreChipText, selected && styles.genreChipTextSelected]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.75}
            disabled={saving}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveText}>Save changes</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingTop: 24 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 24,
  },
  cardLarge: { maxWidth: 640, alignSelf: "center", width: "100%", padding: 28 },

  // Avatar
  avatarSection: { alignItems: "center", gap: 8 },
  avatarWrap:    { position: "relative" },
  avatarImage:   { width: 96, height: 96, borderRadius: 48, backgroundColor: "#e2e8f0" },
  avatarFallback: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#2563eb",
    justifyContent: "center", alignItems: "center",
  },
  avatarInitial:  { color: "#fff", fontSize: 38, fontWeight: "700" },
  avatarOverlay: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    paddingVertical: 4,
    alignItems: "center",
  },
  avatarOverlayText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  avatarHint:        { fontSize: 13, color: "#94a3b8" },

  // Fields
  field:         { gap: 8 },
  fieldLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fieldLabel:    { fontSize: 13, fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.4 },
  fieldHint:     { fontSize: 12, color: "#94a3b8" },
  charCount:     { fontSize: 12, color: "#94a3b8", fontWeight: "500" },
  charCountOver: { color: "#ef4444" },

  readonlyField: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  readonlyText: { fontSize: 15, color: "#94a3b8" },

  bioInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
    minHeight: 100,
    lineHeight: 22,
  },

  // Genre grid
  genreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  genreChip: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  genreChipSelected:     { backgroundColor: "#eff6ff", borderColor: "#3b82f6" },
  genreChipText:         { fontSize: 13, fontWeight: "600", color: "#64748b" },
  genreChipTextSelected: { color: "#1d4ed8" },

  // Actions
  actions: { flexDirection: "row", gap: 12, marginTop: 4 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },
  cancelText:         { fontSize: 15, fontWeight: "600", color: "#64748b" },
  saveButton:         { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  saveButtonDisabled: { backgroundColor: "#93c5fd" },
  saveText:           { fontSize: 15, fontWeight: "700", color: "#ffffff" },
});