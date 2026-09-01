export const AI_UNAVAILABLE_MESSAGE =
  "AI is temporarily unavailable. Please try again later.";

export const AI_QUOTA_EXHAUSTED_MESSAGE =
  "Insufficient balance. Please try again later.";

export const AI_RATE_LIMIT_MESSAGE =
  "Too many requests. Please wait a moment and try again.";

export const AI_GENERIC_FAILURE_MESSAGE =
  "Something went wrong. Please try again.";

function collectErrorText(error: unknown): string {
  if (typeof error === "string") return error.toLowerCase();
  if (error instanceof Error) {
    return [error.message, error.cause ? collectErrorText(error.cause) : ""]
      .join(" ")
      .toLowerCase();
  }
  return String(error).toLowerCase();
}

function isQuotaExhausted(text: string): boolean {
  return (
    text.includes("insufficient_quota") ||
    text.includes("exceeded your current quota") ||
    text.includes("billing hard limit") ||
    text.includes("credit balance") ||
    text.includes("out of credits") ||
    text.includes("quota exceeded") ||
    text.includes("insufficient balance")
  );
}

function isRateLimited(text: string): boolean {
  return (
    text.includes("429") ||
    text.includes("rate limit") ||
    text.includes("too many requests") ||
    text.includes("busy right now")
  );
}

export function getUserFacingAiErrorMessage(error: unknown): string {
  const text = collectErrorText(error);

  if (isQuotaExhausted(text)) return AI_QUOTA_EXHAUSTED_MESSAGE;
  if (isRateLimited(text)) return AI_RATE_LIMIT_MESSAGE;
  if (
    text.includes("temporarily unavailable") ||
    text.includes("overloaded") ||
    text.includes("503")
  ) {
    return AI_UNAVAILABLE_MESSAGE;
  }

  return AI_GENERIC_FAILURE_MESSAGE;
}

/** Parse AI SDK / fetch error payloads into a user-safe chat message. */
export function parseChatErrorMessage(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return AI_GENERIC_FAILURE_MESSAGE;

  const lower = trimmed.toLowerCase();
  if (
    lower.includes("no free trials remaining") ||
    lower.includes("upgrade to premium")
  ) {
    return trimmed;
  }

  if (
    lower.includes(AI_QUOTA_EXHAUSTED_MESSAGE.toLowerCase()) ||
    lower.includes(AI_RATE_LIMIT_MESSAGE.toLowerCase()) ||
    lower.includes(AI_UNAVAILABLE_MESSAGE.toLowerCase()) ||
    lower.includes(AI_GENERIC_FAILURE_MESSAGE.toLowerCase())
  ) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed) as { error?: unknown; message?: unknown };
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parseChatErrorMessage(parsed.error);
    }
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parseChatErrorMessage(parsed.message);
    }
  } catch {
    /* not JSON */
  }

  return getUserFacingAiErrorMessage(trimmed);
}
