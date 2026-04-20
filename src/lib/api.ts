import { authClient } from "@/lib/authClient";
import { webApiBase } from "@/lib/env";

function joinUrl(base: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${p}`;
}

type ApiRequestInit = Omit<RequestInit, "body" | "headers"> & {
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
};

function withQueryParams(url: string, params?: ApiRequestInit["params"]): string {
  if (!params) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    qs.set(k, String(v));
  }
  const q = qs.toString();
  if (!q) return url;
  return url.includes("?") ? `${url}&${q}` : `${url}?${q}`;
}

async function request<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const cookie = authClient.getCookie();
  const headers: Record<string, string> = {
    ...(init.body == null ? {} : { "Content-Type": "application/json" }),
    ...(init.headers ?? {}),
    ...(cookie ? { Cookie: cookie } : {}),
  };

  const res = await fetch(withQueryParams(joinUrl(webApiBase(), path), init.params), {
    ...init,
    headers,
    body: init.body == null ? undefined : JSON.stringify(init.body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  // Many endpoints are JSON; if not, callers can use fetch directly.
  return (await res.json()) as T;
}

// Axios-like surface area used across the app.
export const api = {
  get: async <T>(path: string, init?: Omit<ApiRequestInit, "method" | "body">) => ({
    data: await request<T>(path, { ...init, method: "GET" }),
  }),
  post: async <T>(path: string, body?: unknown, init?: Omit<ApiRequestInit, "method" | "body">) => ({
    data: await request<T>(path, { ...init, method: "POST", body }),
  }),
  patch: async <T>(path: string, body?: unknown, init?: Omit<ApiRequestInit, "method" | "body">) => ({
    data: await request<T>(path, { ...init, method: "PATCH", body }),
  }),
  delete: async <T = unknown>(path: string, init?: Omit<ApiRequestInit, "method" | "body">) => ({
    data: await request<T>(path, { ...init, method: "DELETE" }),
  }),
};
