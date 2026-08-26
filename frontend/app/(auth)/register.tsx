import axios from "axios";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/auth";
// TODO: Uncomment this when building the native APK with Google OAuth enabled.
// import { useGoogleSignIn } from "../hooks/useGoogleSignIn-corrected";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    comfirmPassword:""
  });
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const router = useRouter()
  const URL = process.env.EXPO_PUBLIC_BASE_URL;
  const { login } = useAuth()

  // TODO: Uncomment this when building the APK/native app with Google OAuth enabled.
  // const { signIn: googleSignIn, isLoading: googleLoading, error: googleError, clearError: clearGoogleError } = useGoogleSignIn({
  //   androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID || "",
  //   iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID || "",
  //   webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || "",
  //   apiUrl: process.env.EXPO_PUBLIC_BASE_URL || "",
  // })

  type Form = {
    email: string;
    username: string;
    password: string;
    comfirmPassword: string;
  };

  const handleChange = <K extends keyof Form>(
    field: K,
    value: Form[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (loading) return

    setLoading(true)
    setMessage(null)
    setError(null)
    
    if (!form.email.trim().toLowerCase() || !form.password || !form.username.trim()) {
        setError("Fill all fields")
        setLoading(false)
        return
    }

    if(form.password !== form.comfirmPassword){
        setError("Password doesn't match")
        setLoading(false)
        return
    }

    const payload = {
        email: form.email.trim().toLowerCase(),
        username: form.username.trim(),
        password: form.password
    }

    try {
      const response = await axios.post(`${URL}auth/register/`, payload);

      if (response.status !== 201) return;

      setMessage("Successfully Created an Account")
      
      // Auto-login after registration
      await login({
        id: response.data.user.id,
        username: response.data.user.username,
        token: response.data.token,
        email: response.data.user.email,
        createdAt: response.data.user.createdAt,
      })

      if (response.data?.token) {
        await AsyncStorage.setItem("token", response.data.token)
        await AsyncStorage.setItem("userId", response.data.user.id)
      }

      setTimeout(() => {
        router.replace("/")
      }, 1500)
    } catch (error: any) {
      if (error.response) {
        setError(
          error.response?.data?.error || "Retry, network error."
        );
      } else {
        setError("Network Error, Check your connection.")
      }
    } finally {
        setLoading(false)
    }
  };

  // TODO: Uncomment this when building the APK/native app with Google OAuth enabled.
  // const handleGoogleSignUp = async () => {
  //   setError(null)
  //   setMessage(null)

  //   const result = await googleSignIn()

  //   if (!result.success) {
  //     setError(result.error || "Google sign-up failed")
  //     return
  //   }

  //   try {
  //     setMessage("Creating account with Google...")

  //     await login({
  //       id: result.user!.id,
  //       username: result.user!.username || result.user!.email,
  //       token: result.token!,
  //       email: result.user!.email,
  //       createdAt: result.user!.createdAt,
  //     })

  //     if (result.token) {
  //       await AsyncStorage.setItem("token", result.token)
  //       await AsyncStorage.setItem("userId", result.user!.id)
  //     }

  //     setTimeout(() => {
  //       router.replace("/")
  //     }, 1500)
  //   } catch (err: any) {
  //     setError(err.message || "Failed to complete sign-up")
  //   }
  // }

  useEffect(() => {
    if (!error && !message) return;

    const clear = setTimeout(() => {
      setError(null);
      setMessage(null)
    }, 5000);

    return () => clearTimeout(clear);
  }, [error, message]);

  // TODO: Uncomment this when building the APK/native app with Google OAuth enabled.
  // useEffect(() => {
  //   if (googleError) {
  //     setError(googleError)
  //     clearGoogleError()
  //   }
  // }, [googleError])

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>
          Sign up to get started
        </Text>

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

        {/* TODO: Uncomment this Google sign-up button when building the APK/native app with Google OAuth enabled. */}
        {/*
        <TouchableOpacity
          onPress={handleGoogleSignUp}
          activeOpacity={0.85}
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.googleButtonText}>🔍 Sign up with Google</Text>
          )}
        </TouchableOpacity>
        */}

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            value={form.email}
            onChangeText={(text) =>
              handleChange("email", text)
            }
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            placeholder="Choose a unique username"
            placeholderTextColor="#94a3b8"
            value={form.username}
            onChangeText={(text) =>
              handleChange("username", text)
            }
            autoCapitalize="none"
            style={styles.input}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
                placeholder="Create a strong password"
                placeholderTextColor="#94a3b8"
                value={form.password}
                onChangeText={(text) =>
                handleChange("password", text)
                }
                secureTextEntry={!showPassword}
                style={[styles.input, {flex: 1}]}
                editable={!loading}
            />
            <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showButton}
            >
                <Text style={styles.showButtonText}>
                    {showPassword ? "Hide" : "Show"}
                </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Retype password"
              placeholderTextColor="#94a3b8"
              value={form.comfirmPassword}
              onChangeText={(text) =>
                handleChange("comfirmPassword", text)
              }
              secureTextEntry={!showConfirmPassword}
              style={[styles.input, {flex: 1}]}
              editable={!loading}
            />
            <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.showButton}
            >
              <Text style={styles.showButtonText}>
                  {showConfirmPassword ? "Hide": "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.8}
          style={[styles.button, 
            loading && styles.buttonDisabled
          ]}
          disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#ffffff" />
            ):(
              <Text style={styles.buttonText}>Register</Text>
            )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?
          </Text>
          <Link href="(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}> Login </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ffffff",
      paddingHorizontal: 20,
      justifyContent: "center",
      alignItems: "center",
    },
  
    card: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: "#ffffff",
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: "#f1f5f9",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
  
    title: {
      fontSize: 24,
      fontWeight: "600",
      color: "#0f172a",
      textAlign: "center",
    },
  
    subtitle: {
      fontSize: 14,
      color: "#64748b",
      textAlign: "center",
      marginTop: 4,
    },
  
    errorBox: {
      marginTop: 16,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: "#fef2f2",
      borderWidth: 1,
      borderColor: "#fecaca",
    },
  
    errorText: {
      color: "#b91c1c",
      fontSize: 14,
      textAlign: "center",
    },

    successBox: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: "#f0fdf4", 
        borderWidth: 1,
        borderColor: "#bbf7d0",
      },
      
    successText: {
        color: "#166534", 
        fontSize: 14,
        textAlign: "center",
      },

    googleButton: {
      marginTop: 16,
      backgroundColor: "#f1f5f9",
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e2e8f0",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    googleButtonText: {
      color: "#0f172a",
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
    },

    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
      gap: 12,
    },

    divider: {
      flex: 1,
      height: 1,
      backgroundColor: "#e2e8f0",
    },

    dividerText: {
      color: "#94a3b8",
      fontSize: 13,
      fontWeight: "500",
    },
  
    field: {
      marginTop: 20,
    },
  
    label: {
      fontSize: 13,
      color: "#475569",
      marginBottom: 6,
    },
  
    input: {
      borderWidth: 1,
      borderColor: "#e2e8f0",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: "#0f172a",
      backgroundColor: "#ffffff",
    },
  
    button: {
      marginTop: 24,
      backgroundColor: "#2563eb",
      paddingVertical: 14,
      borderRadius: 12,
    },
  
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 0,
        backgroundColor: "#ffffff",
      },
      
    showButton: {
        paddingHorizontal: 10,
        justifyContent: "center",
        alignItems: "center",
      },
      
    showButtonText: {
        color: "#2563eb",
        fontWeight: "500",
        fontSize: 14,
      },
      
    buttonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },

    buttonDisabled: {
        opacity: 0.7,
      },

    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 24,
    },
    
    footerText: {
      color: "#64748b",
      fontSize: 14,
    },

    link: {
      color: "#2563eb",
      fontSize: 14,
      fontWeight: "500",
    },
});