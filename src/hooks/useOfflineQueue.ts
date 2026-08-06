import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  deletePersistedOfflineMedia,
  enqueueOfflineJob,
  listActiveOfflineJobs,
  listOfflineJobsForConversation,
  nextFlushableJob,
  persistOfflineMedia,
  pruneOfflineQueue,
  removeOfflineJob,
  requeueFailedJobs,
  setOfflineJobStatus,
  subscribeOfflineQueue,
  type OfflineChatPayload,
  type OfflineJob,
  type OfflineReceiptPayload,
  type OfflineVoicePayload,
} from "@/lib/offlineQueue";
import { transcribeVoiceRecording } from "@/lib/voiceTranscription";
import { uploadReceiptToImageKit } from "@/lib/imagekitUpload";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

function queueVersion(userId: string | undefined): string {
  if (!userId) return "";
  return listActiveOfflineJobs(userId)
    .map((j) => `${j.id}:${j.status}:${j.attempts}`)
    .join("|");
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export type FlushHandlers = {
  sendChatText: (text: string) => Promise<void>;
  sendReceipt: (args: {
    text: string;
    url: string;
    mediaType: string;
  }) => Promise<void>;
  consumeTrial: () => void;
  canUseTrialMessage: () => boolean;
};

export function useOfflineQueue(userId: string | undefined) {
  const { isOnline } = useNetworkStatus();
  const version = useSyncExternalStore(
    subscribeOfflineQueue,
    () => queueVersion(userId),
    () => "",
  );

  const jobs = userId ? listActiveOfflineJobs(userId) : [];

  const jobsForConversation = useCallback(
    (conversationId: string | null) => {
      if (!userId) return [] as OfflineJob[];
      return listOfflineJobsForConversation(userId, conversationId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version is the external-store signal
    [userId, version],
  );

  useEffect(() => {
    pruneOfflineQueue();
  }, []);

  useEffect(() => {
    if (!userId) return;
    for (const j of listActiveOfflineJobs(userId)) {
      if (j.status === "syncing") {
        setOfflineJobStatus(j.id, "queued");
      }
    }
  }, [userId]);

  const wasOfflineRef = useRef(!isOnline);
  useEffect(() => {
    if (wasOfflineRef.current && isOnline && userId) {
      requeueFailedJobs(userId);
    }
    wasOfflineRef.current = !isOnline;
  }, [isOnline, userId]);

  const enqueueChat = useCallback(
    (args: { text: string; conversationId: string | null }) => {
      if (!userId) throw new Error("Not signed in");
      return enqueueOfflineJob({
        type: "chat",
        userId,
        conversationId: args.conversationId,
        payload: { text: args.text } satisfies OfflineChatPayload,
      });
    },
    [userId],
  );

  const enqueueVoice = useCallback(
    async (args: {
      sourceUri: string;
      fileName?: string;
      conversationId: string | null;
    }) => {
      if (!userId) throw new Error("Not signed in");
      const fileName = args.fileName ?? "audio.m4a";
      const localUri = await persistOfflineMedia({
        sourceUri: args.sourceUri,
        fileName,
      });
      return enqueueOfflineJob({
        type: "voice",
        userId,
        conversationId: args.conversationId,
        payload: { localUri, fileName } satisfies OfflineVoicePayload,
      });
    },
    [userId],
  );

  const enqueueReceipt = useCallback(
    async (args: {
      sourceUri: string;
      fileName: string;
      mimeType: string;
      text?: string;
      conversationId: string | null;
    }) => {
      if (!userId) throw new Error("Not signed in");
      const localUri = await persistOfflineMedia({
        sourceUri: args.sourceUri,
        fileName: args.fileName,
      });
      return enqueueOfflineJob({
        type: "receipt",
        userId,
        conversationId: args.conversationId,
        payload: {
          localUri,
          fileName: args.fileName,
          mimeType: args.mimeType,
          text: args.text,
        } satisfies OfflineReceiptPayload,
      });
    },
    [userId],
  );

  const retryJob = useCallback((id: string) => {
    setOfflineJobStatus(id, "queued", { lastError: undefined });
  }, []);

  const dismissFailedJob = useCallback(async (job: OfflineJob) => {
    if (job.type === "voice") {
      await deletePersistedOfflineMedia(
        (job.payload as OfflineVoicePayload).localUri,
      );
    }
    if (job.type === "receipt") {
      await deletePersistedOfflineMedia(
        (job.payload as OfflineReceiptPayload).localUri,
      );
    }
    removeOfflineJob(job.id);
  }, []);

  return {
    isOnline,
    jobs,
    jobsForConversation,
    enqueueChat,
    enqueueVoice,
    enqueueReceipt,
    retryJob,
    dismissFailedJob,
    queueVersion: version,
  };
}

/**
 * FIFO flush while online.
 *
 * Does not abort mid-job when queue status changes or chat goes busy from
 * our own send — that previously froze the UI on "Syncing…".
 */
export function useOfflineQueueFlusher(
  userId: string | undefined,
  conversationId: string | null,
  isChatIdle: boolean,
  handlers: FlushHandlers,
) {
  const { isOnline } = useNetworkStatus();
  const flushingRef = useRef(false);
  const [flushError, setFlushError] = useState<string | null>(null);

  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const isChatIdleRef = useRef(isChatIdle);
  useEffect(() => {
    isChatIdleRef.current = isChatIdle;
  }, [isChatIdle]);

  const conversationIdRef = useRef(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (!userId || !isOnline) return;

    let aborted = false;
    let stopWaitingForJob: (() => void) | null = null;

    const waitUntilChatIdle = async () => {
      while (!aborted && !isChatIdleRef.current) {
        await sleep(32);
      }
    };

    const waitForNextJob = () =>
      new Promise<OfflineJob | null>((resolve) => {
        const take = () =>
          nextFlushableJob(userId, conversationIdRef.current);

        const immediate = take();
        if (immediate) {
          resolve(immediate);
          return;
        }

        const unsub = subscribeOfflineQueue(() => {
          if (aborted) {
            unsub();
            stopWaitingForJob = null;
            resolve(null);
            return;
          }
          const next = take();
          if (next) {
            unsub();
            stopWaitingForJob = null;
            resolve(next);
          }
        });

        stopWaitingForJob = () => {
          unsub();
          stopWaitingForJob = null;
          resolve(null);
        };
      });

    const processJob = async (job: OfflineJob) => {
      const h = handlersRef.current;
      const attempts = job.attempts + 1;

      if (!h.canUseTrialMessage()) {
        setOfflineJobStatus(job.id, "failed", {
          attempts,
          lastError: "No free trials remaining",
        });
        return;
      }

      setOfflineJobStatus(job.id, "syncing");

      try {
        if (job.type === "chat") {
          const { text } = job.payload as OfflineChatPayload;
          h.consumeTrial();
          removeOfflineJob(job.id);
          await h.sendChatText(text);
          if (aborted) return;
        } else if (job.type === "voice") {
          const { localUri, fileName } = job.payload as OfflineVoicePayload;
          const transcript = await transcribeVoiceRecording({
            uri: localUri,
            fileName,
          });
          if (aborted) return;
          h.consumeTrial();
          removeOfflineJob(job.id);
          await h.sendChatText(transcript);
          if (aborted) return;
          await deletePersistedOfflineMedia(localUri);
        } else if (job.type === "receipt") {
          const payload = job.payload as OfflineReceiptPayload;
          const uploaded = await uploadReceiptToImageKit({
            uri: payload.localUri,
            fileName: payload.fileName,
            mimeType: payload.mimeType,
          });
          if (aborted) return;
          h.consumeTrial();
          removeOfflineJob(job.id);
          await h.sendReceipt({
            text: payload.text?.trim() || "Scan this bill",
            url: uploaded.url,
            mediaType: uploaded.mediaType,
          });
          if (aborted) return;
          await deletePersistedOfflineMedia(payload.localUri);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Sync failed";
        const stillThere = listActiveOfflineJobs(job.userId).some(
          (j) => j.id === job.id,
        );
        if (!stillThere) {
          const restored = enqueueOfflineJob({
            type: job.type,
            userId: job.userId,
            conversationId: job.conversationId,
            payload: job.payload,
            idempotencyKey: `${job.idempotencyKey}:retry`,
          });
          setOfflineJobStatus(restored.id, "failed", {
            attempts,
            lastError: msg,
          });
        } else {
          setOfflineJobStatus(job.id, "failed", {
            attempts,
            lastError: msg,
          });
        }
        throw e;
      }
    };

    const runLoop = async () => {
      if (flushingRef.current) return;
      flushingRef.current = true;
      setFlushError(null);

      try {
        for (const j of listActiveOfflineJobs(userId)) {
          if (j.status !== "syncing") continue;
          const sameConv =
            j.conversationId === conversationIdRef.current ||
            (j.conversationId == null && conversationIdRef.current == null);
          if (sameConv) setOfflineJobStatus(j.id, "queued");
        }

        while (!aborted) {
          await waitUntilChatIdle();
          if (aborted) break;

          let job = nextFlushableJob(userId, conversationIdRef.current);
          if (!job) {
            job = await waitForNextJob();
            if (!job || aborted) break;
          }

          try {
            await processJob(job);
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Sync failed";
            if (!aborted) setFlushError(msg);
            // Keep loop alive so Retry can enqueue another queued job.
            await sleep(50);
            continue;
          }

          await sleep(16);
        }
      } finally {
        flushingRef.current = false;
      }
    };

    void runLoop();

    return () => {
      aborted = true;
      stopWaitingForJob?.();
      flushingRef.current = false;
    };
  }, [userId, conversationId, isOnline]);

  return { flushError };
}
