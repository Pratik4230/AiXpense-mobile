const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function getISTDateKey(d = new Date()): string {
  const istNow = new Date(d.getTime() + IST_OFFSET_MS);
  const y = istNow.getUTCFullYear();
  const m = String(istNow.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istNow.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
