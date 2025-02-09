// app/_layout.tsx
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider } from "../src/context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Wait until fonts are loaded
  }

  return (
    <AuthProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ title: "Register", headerShown: true }} />
          <Stack.Screen
            name="edit-profile"
            options={{
              title: "Edit Profile",
              headerShown: true,
              headerBackTitle: "Back",
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="change-password"
            options={{
              title: "Change Password",
              headerShown: true,
              headerBackTitle: "Back",
              presentation: "card",
            }}
          />
          <Stack.Screen name="privacy-security" options={{ title: "Privacy & Security", headerShown: true }} />
          <Stack.Screen name="connect-bank" options={{ title: "Connect Bank", headerShown: true }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
