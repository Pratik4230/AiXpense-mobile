export type OfflineJobType = "chat" | "voice" | "receipt";

export type OfflineJobStatus = "queued" | "syncing" | "done" | "failed";

export type OfflineChatPayload = {
  text: string;
};

export type OfflineVoicePayload = {
  localUri: string;
  fileName: string;
};

export type OfflineReceiptPayload = {
  localUri: string;
  fileName: string;
  mimeType: string;
  /** Optional prompt; defaults to "Scan this bill" on flush */
  text?: string;
};

export type OfflineJobPayload =
  | OfflineChatPayload
  | OfflineVoicePayload
  | OfflineReceiptPayload;

export type OfflineJob = {
  id: string;
  /** Stable idempotency key — never reuse across distinct user actions */
  idempotencyKey: string;
  type: OfflineJobType;
  status: OfflineJobStatus;
  /** null = new chat that had no conversation yet when queued */
  conversationId: string | null;
  userId: string;
  payload: OfflineJobPayload;
  attempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

export const OFFLINE_QUEUE_KEY = "offline_action_queue_v1";
export const MAX_OFFLINE_ATTEMPTS = 3;
