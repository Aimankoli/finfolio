import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { useAuth } from "../src/context/AuthContext";
import { useRouter } from "expo-router";

const SignInScreen: React.FC = () => {
  const { signIn } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("user_good");
  const [password, setPassword] = useState("pass_good");
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch the Plaid link token
  const fetchLinkToken = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching link token...");
      const response = await fetch("http://localhost:8000/create_link_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log("Link token response:", data);

      if (data.link_token) {
        setLinkToken(data.link_token);
        setShowWebView(true);
      } else {
        throw new Error(data.detail || "Failed to get link token");
      }
    } catch (error) {
      console.error("Link token error:", error);
      Alert.alert(
        "Connection Error",
        "Unable to connect to bank services. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle user sign-in
  const handleSignIn = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Attempting sign in...");
      
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful, fetching Plaid token...");
        await fetchLinkToken();
      } else {
        Alert.alert("Login Failed", data.detail || "Invalid credentials");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Error", "Connection failed. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to exchange public token
  const handlePublicTokenExchange = async (publicToken: string) => {
    try {
      setIsLoading(true);
      console.log("Exchanging public token:", publicToken);
      
      const response = await fetch("http://localhost:8000/exchange_public_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          public_token: publicToken 
        }),
      });

      const result = await response.json();
      console.log("Token exchange result:", result);

      if (response.ok && result.access_token) {
        setShowWebView(false);
        await signIn();
        console.log("Authentication successful, redirecting...");
        router.replace("/");
      } else {
        throw new Error(result.detail || "Failed to exchange token");
      }
    } catch (error) {
      console.error("Token exchange error:", error);
      Alert.alert(
        "Connection Error",
        "Failed to link your bank account. Please try again."
      );
      setShowWebView(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Render WebView for Plaid Link
  if (showWebView && linkToken) {
    return (
      <View style={styles.container}>
        <WebView
          source={{
            uri: `https://cdn.plaid.com/link/v2/stable/link.html?token=${linkToken}`,
            headers: {
              'Plaid-Link-Version': '2.0.781'
            }
          }}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              console.log("Plaid message received:", data);

              switch (data.eventName) {
                case 'SUCCESS':
                  if (data.metadata && data.metadata.public_token) {
                    console.log("Successfully obtained public token");
                    handlePublicTokenExchange(data.metadata.public_token);
                  }
                  break;
                  
                case 'EXIT':
                  console.log("User exited Plaid Link");
                  setShowWebView(false);
                  break;

                case 'LOAD':
                  console.log("Plaid Link loaded");
                  break;

                default:
                  console.log("Other Plaid event:", data.eventName);
              }
            } catch (error) {
              console.error("Error processing Plaid message:", error);
            }
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            Alert.alert(
              "Error",
              "There was a problem loading the bank connection interface."
            );
            setShowWebView(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error: ', nativeEvent.statusCode);
          }}
          style={styles.webview}
        />
      </View>
    );
  }

  // Render login form
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#666"
        editable={!isLoading}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#666"
        editable={!isLoading}
        autoCapitalize="none"
      />
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Connecting..." : "Sign In & Connect Bank"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  webview: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 30,
    textAlign: "center",
    marginTop: 100,
  },
  input: {
    width: "85%",
    height: 50,
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    alignSelf: "center",
  },
  button: {
    width: "85%",
    backgroundColor: "#6200ee",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#9b7bce",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default SignInScreen;