import React, { useState, useEffect, useRef } from "react";
import { View, Button, ActivityIndicator, Alert, StyleSheet, Text, TextInput } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

const LOGIN_URL = "http://localhost:8000/login";
const CREATE_LINK_TOKEN_URL = "http://localhost:8000/create_link_token";
const EXCHANGE_PUBLIC_TOKEN_URL = "http://localhost:8000/exchange_public_token";

const SignInScreen: React.FC = () => {
  const router = useRouter();
  const { signIn, isLoading: authLoading, setUsername } = useAuth();
  const [username, setLocalUsername] = useState("user_good");
  const [password, setPassword] = useState("pass_good");
  const [isLoading, setIsLoading] = useState(false);
  const fallbackTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => {
      subscription.remove();
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  const handleDeepLink = async (event: { url: string }) => {
    console.log("Deep link received:", event.url);
    try {
      const urlObj = new URL(event.url);
      const publicToken = urlObj.searchParams.get("public_token");

      if (publicToken) {
        console.log("Public token received:", publicToken);
        if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
        await WebBrowser.dismissBrowser();
        await handlePublicTokenExchange(publicToken);
      } else {
        console.log("No public token found in deep link");
        await WebBrowser.dismissBrowser();
      }
    } catch (error) {
      console.error("Error parsing deep link:", error);
      await WebBrowser.dismissBrowser();
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        console.log("Login successful. Fetching link token...");
        setUsername(username); // Set username in context
        await fetchLinkToken();
      } else {
        Alert.alert("Login Failed", "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLinkToken = async () => {
    try {
      const response = await fetch(CREATE_LINK_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.link_token) {
        await openPlaidLink(data.link_token);
      } else {
        throw new Error("Link token not received");
      }
    } catch (error) {
      console.error("Error fetching link token:", error);
      Alert.alert("Error", "Unable to get link token.");
    }
  };

  const openPlaidLink = async (token: string) => {
    try {
      console.log("🚀 Starting Plaid Link flow...");
      const redirectUrl = Linking.createURL("plaid");
      const authUrl = `https://cdn.plaid.com/link/v2/stable/link.html?token=${token}&redirect_uri=${encodeURIComponent(
        redirectUrl
      )}`;
      console.log("📍 Opening URL:", authUrl);

      fallbackTimer.current = setTimeout(async () => {
        console.log("⚠️ Fallback timeout reached");
        await WebBrowser.dismissBrowser();
      }, 10000);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      console.log("📱 Plaid WebBrowser result:", result);
      
      if (result.type === "cancel") {
        console.log("❌ User cancelled Plaid flow");
        try {
          console.log("🔑 Attempting to sign in...");
          await signIn(username);
          console.log("✅ Sign in successful");
          console.log("🔄 Redirecting to explore page...");
          router.replace("/(tabs)/explore");
        } catch (error) {
          console.error("🚨 Error during sign in:", error);
        }
      }
    } catch (error) {
      console.error("🚨 Error in Plaid flow:", error);
      Alert.alert("Error", "An issue occurred with Plaid Link.");
    } finally {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    }
  };

  const handlePublicTokenExchange = async (publicToken: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(EXCHANGE_PUBLIC_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, public_token: publicToken }),
      });
      const data = await response.json();

      if (response.ok && data.access_token) {
        console.log("Access token exchange successful");
        await signIn(username);
        console.log("Sign in successful, navigating to tabs...");
        router.replace("/(tabs)/explore");
      } else {
        throw new Error("Access token exchange failed");
      }
    } catch (error) {
      console.error("Error exchanging public token:", error);
      Alert.alert("Error", "Failed to link bank account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setLocalUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button
          title="Sign In with Plaid"
          onPress={handleLogin}
          disabled={isLoading || authLoading}
        />
        <Button
          title="Register New Account"
          onPress={() => router.push("/register")}
          disabled={isLoading || authLoading}
        />
      </View>
      {(isLoading || authLoading) && <ActivityIndicator style={{ marginTop: 20 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    maxWidth: 300,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    gap: 15,
    width: "100%",
    maxWidth: 300,
  },
});

export default SignInScreen;
