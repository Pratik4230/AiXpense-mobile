import { authClient } from "@/lib/authClient";
import { webApiBase } from "@/lib/env";

const IMAGEKIT_UPLOAD = "https://upload.imagekit.io/api/v1/files/upload";

export type ImageKitAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

export async function fetchImageKitAuth(): Promise<ImageKitAuth> {
  const cookies = authClient.getCookie();
  const res = await fetch(`${webApiBase()}/api/imagekit-auth`, {
    headers: cookies ? { Cookie: cookies } : undefined,
  });
  if (!res.ok) {
    throw new Error(res.status === 401 ? "Unauthorized" : "Failed to get upload credentials");
  }
  return res.json();
}

export type UploadReceiptParams = {
  uri: string;
  fileName: string;
  mimeType: string;
};

/**
 * Client-side upload to ImageKit (same flow as web `ChatInput` + `/receipts`).
 */
export async function uploadReceiptToImageKit(
  params: UploadReceiptParams,
): Promise<{ url: string; mediaType: string }> {
  const auth = await fetchImageKitAuth();

  const form = new FormData();
  form.append("file", {
    uri: params.uri,
    name: params.fileName,
    type: params.mimeType,
  } as unknown as Blob);
  form.append("fileName", params.fileName);
  form.append("folder", "/receipts");
  form.append("signature", auth.signature);
  form.append("expire", String(auth.expire));
  form.append("token", auth.token);
  form.append("publicKey", auth.publicKey);
  form.append("useUniqueFileName", "true");

  const uploadRes = await fetch(IMAGEKIT_UPLOAD, {
    method: "POST",
    body: form,
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.text().catch(() => "");
    throw new Error(body || "ImageKit upload failed");
  }

  const data = (await uploadRes.json()) as { url?: string };
  if (!data.url) throw new Error("Upload response missing URL");

  return { url: data.url, mediaType: params.mimeType };
}
