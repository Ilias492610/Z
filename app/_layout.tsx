import React from "react";
import SupabaseProvider from "@/context/SupabaseContext";
import TwitterProvider from "@/context/TwitterContext";
import "@/global.css";

import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useColorScheme } from "nativewind";

export {
  ErrorBoundary,
} from 'expo-router';

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <SupabaseProvider>
      <TwitterProvider>
        <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
        </ThemeProvider>
      </TwitterProvider>
    </SupabaseProvider>
  );
}
