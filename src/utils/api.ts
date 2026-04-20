import Constants from "expo-constants";
import { webApiBase } from "@/lib/env";

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

  if (process.env.NODE_ENV === "development") {
    const hostUri = Constants.expoConfig?.hostUri;
    if (!hostUri) {
      throw new Error(
        "Could not determine Metro server host. Make sure the app is running via Expo CLI.",
      );
    }
    return `http://${hostUri}${path}`;
  }

  // In production/native builds, API routes live on the deployed web backend.
  // Prefer `EXPO_PUBLIC_WEB_API_URL` (via `webApiBase()`), keep API_BASE_URL as optional override.
  const base =
    process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? webApiBase();
  return `${base}${path}`;
};
