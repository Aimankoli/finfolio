import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.log("📱 TabLayout: Component mounted");
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log("🔄 TabLayout: State changed:", {
      isMounted,
      isAuthenticated,
      currentTime: new Date().toISOString()
    });
    
    if (isMounted && !isAuthenticated) {
      console.log("⚠️ TabLayout: No authentication, redirecting to signin");
      router.replace("/signin");
    } else if (isMounted && isAuthenticated) {
      console.log("✅ TabLayout: User is authenticated");
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
    </Tabs>
  );
}
