"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { Link, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useAuth } from "../context/auth"

const { width, height } = Dimensions.get("window")
const isSmallScreen = width < 375

export default function Login() {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  })

  const { login } = useAuth()
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const router = useRouter()
  const URL = process.env.EXPO_PUBLIC_BASE_URL

  type Form = {
    identifier: string
    password: string
  }

  const handleChanges = <K extends keyof Form>(field: K, value: Form[K]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const submit = async () => {
    if (!URL) return
    if (loading) return

    setLoading(true)
    setError(null)
    setMessage(null)

    if (!form.identifier || !form.password) {
      setError("Missing Credential")
      setLoading(false)
      return
    }

    const isEmail = form.identifier.includes("@")

    const payload = {
      password: form.password,
      ...(isEmail ? { email: form.identifier.trim().toLowerCase() } : { username: form.identifier.trim() }),
    }

    try {
      const response = await axios.post(`${URL}auth/login/`, payload)

      if (response.status !== 200) return

      setMessage("Login Successfully")

      await login({
        id: response.data.user.id,
        username: response.data.user.username,
        token: response.data.token,
        email: response.data.user.email,
        createdAt: response.data.user.createdAt,
      })

      if (response.data?.token) {
        await AsyncStorage.setItem("token", response.data.token)
      }

      setForm({ identifier: "", password: "" })
      router.replace("/")
    } catch (error: any) {
      if (error.response) {
        setError(error.response?.data?.error || "Retry, network error.")
      } else {
        setError("Network Error, Check your connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!error && !message) return

    const clear = setTimeout(() => {
      setError(null)
      setMessage(null)
    }, 5000)

    return () => clearTimeout(clear)
  }, [error, message])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 50 : 0}
    >
      <View style={styles.container}>
        <View style={styles.brandSection}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>iT</Text>
          </View>
          <Text style={styles.brandName}>improvTrend</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to your account</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {message && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{message}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              value={form.identifier}
              onChangeText={(text) => handleChanges("identifier", text)}
              placeholder="you@example.com or username"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              editable={!loading}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                value={form.password}
                onChangeText={(text) => handleChanges("password", text)}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                style={[styles.input, { flex: 1, borderWidth: 0, paddingVertical: 0 }]}
                returnKeyType="done"
                onSubmitEditing={submit}
                editable={!loading}
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showButton}>
                <Text style={styles.showButtonText}>{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={submit}
            activeOpacity={0.85}
            style={[styles.button, loading && styles.buttonDisabled]}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Sign In</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.link}> Create one</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 12,
  },

  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },

  brandIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  brandName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.5,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: isSmallScreen ? 20 : 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  title: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },

  field: {
    marginTop: 20,
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },

  forgotLink: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    fontWeight: "500",
  },

  button: {
    marginTop: 28,
    backgroundColor: "#1F2937",
    paddingVertical: 14,
    borderRadius: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 4,
  },

  footerText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },

  link: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },

  showButton: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  showButtonText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 13,
  },

  successBox: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },

  successText: {
    color: "#166534",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },

  errorBox: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
})
