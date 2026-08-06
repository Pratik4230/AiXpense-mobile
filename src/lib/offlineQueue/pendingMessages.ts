import type { OfflineJob, OfflineChatPayload, OfflineReceiptPayload } from "@/lib/offlineQueue";

export type PendingChatMessage = {
  id: string;
  role: "user";
  parts: any[];
  pendingStatus: "queued" | "syncing" | "failed";
  pendingJobId: string;
  pendingError?: string;
};

export function offlineJobsToPendingMessages(
  jobs: OfflineJob[],
): PendingChatMessage[] {
  return jobs
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((job) => {
      const pendingStatus =
        job.status === "syncing"
          ? ("syncing" as const)
          : job.status === "failed"
            ? ("failed" as const)
            : ("queued" as const);

      if (job.type === "chat") {
        const { text } = job.payload as OfflineChatPayload;
        return {
          id: `pending-${job.id}`,
          role: "user" as const,
          parts: [{ type: "text", text }],
          pendingStatus,
          pendingJobId: job.id,
          pendingError: job.lastError,
        };
      }

      if (job.type === "voice") {
        return {
          id: `pending-${job.id}`,
          role: "user" as const,
          parts: [{ type: "text", text: "🎤 Voice note (queued)" }],
          pendingStatus,
          pendingJobId: job.id,
          pendingError: job.lastError,
        };
      }

      const receipt = job.payload as OfflineReceiptPayload;
      const label = receipt.text?.trim() || "Scan this bill";
      return {
        id: `pending-${job.id}`,
        role: "user" as const,
        parts: [
          { type: "text", text: label },
          {
            type: "file",
            mediaType: receipt.mimeType,
            url: receipt.localUri,
          },
        ],
        pendingStatus,
        pendingJobId: job.id,
        pendingError: job.lastError,
      };
    });
}
