import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_WEB_API_URL ?? "http://localhost:3000",
  plugins: [
    expoClient({
      scheme: "aixpensemobile",
      storagePrefix: "aixpense",
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
