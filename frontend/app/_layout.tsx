import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
    return null; // Prevent rendering until fonts are loaded
  }

  return (
    <AuthProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" options={{ title: "Edit Profile",headerShown: true, headerBackTitle: "Back", headerBackVisible: true, presentation: 'card'  }} />
          <Stack.Screen name="change-password" options={{ title: "Change Password", headerShown: true, headerBackTitle: "Back", headerBackVisible: true, presentation: 'card' }} />
          <Stack.Screen name="privacy-security" options={{ title: "Privacy & Security", headerShown: true }} />


        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
