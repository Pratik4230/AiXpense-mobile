import axios from "axios";
import { authClient } from "@/lib/authClient";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_WEB_API_URL ?? "http://localhost:3000",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const cookies = authClient.getCookie();
  if (cookies) {
    config.headers["Cookie"] = cookies;
    config.withCredentials = false;
  }
  return config;
});
