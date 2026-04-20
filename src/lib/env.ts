function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export function webApiBase(): string {
  return stripTrailingSlash(
    process.env.EXPO_PUBLIC_WEB_API_URL ?? "http://localhost:3000",
  );
}

