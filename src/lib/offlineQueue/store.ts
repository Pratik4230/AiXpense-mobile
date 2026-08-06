import { storage } from "@/lib/storage";
import {
  OFFLINE_QUEUE_KEY,
  MAX_OFFLINE_ATTEMPTS,
  type OfflineJob,
  type OfflineJobStatus,
  type OfflineJobType,
  type OfflineJobPayload,
} from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();

function readAll(): OfflineJob[] {
  const raw = storage.getString(OFFLINE_QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OfflineJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(jobs: OfflineJob[]) {
  storage.set(OFFLINE_QUEUE_KEY, JSON.stringify(jobs));
  listeners.forEach((l) => l());
}

export function subscribeOfflineQueue(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function listOfflineJobs(): OfflineJob[] {
  return readAll();
}

export function listActiveOfflineJobs(userId: string): OfflineJob[] {
  return readAll().filter(
    (j) =>
      j.userId === userId &&
      (j.status === "queued" || j.status === "syncing" || j.status === "failed"),
  );
}

export function listOfflineJobsForConversation(
  userId: string,
  conversationId: string | null,
): OfflineJob[] {
  return listActiveOfflineJobs(userId).filter((j) => {
    if (conversationId == null) return j.conversationId == null;
    return j.conversationId === conversationId;
  });
}

function newId(): string {
  return `oq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function enqueueOfflineJob(input: {
  type: OfflineJobType;
  conversationId: string | null;
  userId: string;
  payload: OfflineJobPayload;
  idempotencyKey?: string;
}): OfflineJob {
  const now = new Date().toISOString();
  const job: OfflineJob = {
    id: newId(),
    idempotencyKey: input.idempotencyKey ?? newId(),
    type: input.type,
    status: "queued",
    conversationId: input.conversationId,
    userId: input.userId,
    payload: input.payload,
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };
  const jobs = readAll().filter((j) => j.status !== "done");
  jobs.push(job);
  writeAll(jobs);
  return job;
}

export function updateOfflineJob(
  id: string,
  patch: Partial<
    Pick<OfflineJob, "status" | "attempts" | "lastError" | "conversationId" | "payload">
  >,
): OfflineJob | null {
  const jobs = readAll();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx < 0) return null;
  const next: OfflineJob = {
    ...jobs[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  jobs[idx] = next;
  writeAll(jobs);
  return next;
}

export function setOfflineJobStatus(
  id: string,
  status: OfflineJobStatus,
  extra?: { lastError?: string; attempts?: number },
) {
  return updateOfflineJob(id, {
    status,
    ...(extra?.lastError !== undefined ? { lastError: extra.lastError } : {}),
    ...(extra?.attempts !== undefined ? { attempts: extra.attempts } : {}),
  });
}

export function removeOfflineJob(id: string) {
  writeAll(readAll().filter((j) => j.id !== id));
}

/** Drop completed jobs older than 7 days to keep MMKV small. */
export function pruneOfflineQueue() {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  writeAll(
    readAll().filter((j) => {
      if (j.status !== "done") return true;
      return new Date(j.updatedAt).getTime() > weekAgo;
    }),
  );
}

export function nextFlushableJob(
  userId: string,
  conversationId: string | null,
): OfflineJob | null {
  const active = listOfflineJobsForConversation(userId, conversationId)
    .filter((j) => j.status === "queued")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return active[0] ?? null;
}

/** Bind new-chat queued jobs to the conversation id once it exists. */
export function bindOfflineJobsToConversation(
  userId: string,
  conversationId: string,
) {
  const jobs = readAll();
  let changed = false;
  for (const j of jobs) {
    if (
      j.userId === userId &&
      j.conversationId == null &&
      j.status !== "done"
    ) {
      j.conversationId = conversationId;
      j.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) writeAll(jobs);
}

/** When connectivity returns, move failed jobs back to queued for another pass. */
export function requeueFailedJobs(userId: string) {
  const jobs = readAll();
  let changed = false;
  for (const j of jobs) {
    if (
      j.userId === userId &&
      j.status === "failed" &&
      j.attempts < MAX_OFFLINE_ATTEMPTS
    ) {
      j.status = "queued";
      j.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) writeAll(jobs);
}
