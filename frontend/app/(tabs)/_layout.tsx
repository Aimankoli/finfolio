// app/(tabs)/_layout.tsx
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      console.log("Redirecting to /signin...");
      router.replace("/signin");
    }
  }, [isMounted, isAuthenticated]);

  if (!isMounted) {
    return null; // Prevent rendering until mounted
  }

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
