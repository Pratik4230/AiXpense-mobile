const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function getISTDateKey(d = new Date()): string {
  const istNow = new Date(d.getTime() + IST_OFFSET_MS);
  const y = istNow.getUTCFullYear();
  const m = String(istNow.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istNow.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Next 20:00 Asia/Kolkata wall time at or after `from` (one-off reminder). */
export function nextStreakReminderIST(from = new Date()): Date {
  const todayKey = getISTDateKey(from);
  let target = new Date(`${todayKey}T20:00:00+05:30`);
  if (target.getTime() <= from.getTime()) {
    const noon = new Date(`${todayKey}T12:00:00+05:30`);
    const tomorrow = new Date(noon.getTime() + 86_400_000);
    const tk = getISTDateKey(tomorrow);
    target = new Date(`${tk}T20:00:00+05:30`);
  }
  return target;
}
