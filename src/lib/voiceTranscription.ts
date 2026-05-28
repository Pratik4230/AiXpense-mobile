import { File } from "expo-file-system";
import { authClient } from "@/lib/authClient";
import { webApiBase } from "@/lib/env";

export async function transcribeVoiceRecording(params: {
  uri: string;
  fileName?: string;
}): Promise<string> {
  const cookies = authClient.getCookie();
  const fileName = params.fileName ?? "audio.m4a";

  const audioFile = new File(params.uri);
  const form = new FormData();
  form.append("audio", audioFile, fileName);

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
