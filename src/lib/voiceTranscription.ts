import { authClient } from "@/lib/authClient";

function webApiBase(): string {
  return (process.env.EXPO_PUBLIC_WEB_API_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

/**
 * Sends recorded audio to the Next.js `/api/voice` route (Sarvam STT), same contract as web `useSarvamSTT`.
 */
export async function transcribeVoiceRecording(params: {
  uri: string;
  fileName?: string;
  mimeType?: string;
}): Promise<string> {
  const cookies = authClient.getCookie();
  const fileName = params.fileName ?? "audio.m4a";
  const mimeType = params.mimeType ?? "audio/mp4";

  const form = new FormData();
  form.append("audio", {
    uri: params.uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const res = await fetch(`${webApiBase()}/api/voice`, {
    method: "POST",
    headers: cookies ? { Cookie: cookies } : undefined,
    body: form,
  });

  const data = (await res.json().catch(() => ({}))) as {
    transcript?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? "Transcription failed");
  }

  const t = data.transcript?.trim();
  if (!t) throw new Error("No speech detected");
  return t;
}
