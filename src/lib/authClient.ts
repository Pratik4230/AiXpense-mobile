import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { webApiBase } from "@/lib/env";

function getAppScheme(): string {
  const raw = Constants.expoConfig?.scheme;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw[0]) return raw[0];
  return "aixpense";
}

function getStoragePrefix(): string {
  const extra = Constants.expoConfig?.extra as
    | { storagePrefix?: string }
    | undefined;
  return extra?.storagePrefix ?? getAppScheme();
}

const CLIENT_PLATFORM_HEADER = "x-aixpense-client";

export const authClient = createAuthClient({
  baseURL: webApiBase(),
  fetchOptions: {
    headers: {
      [CLIENT_PLATFORM_HEADER]: "android",
    },
  },
  plugins: [
    expoClient({
      scheme: getAppScheme(),
      storagePrefix: getStoragePrefix(),
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
