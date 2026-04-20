import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import { webApiBase } from "@/lib/env";

export const authClient = createAuthClient({
  baseURL: webApiBase(),
  plugins: [
    expoClient({
      scheme: "aixpense",
      storagePrefix: "aixpense",
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
