import { buildReminderJobs, type ReminderJob } from "@/lib/notifications/reminders";
import type { NotificationSettings } from "@/lib/types";
import type { PushPayload, StoredPushSubscription } from "@/lib/push/types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Data e orario locali (HH:MM) nella timezone IANA dell'utente. */
export function localParts(now: Date, timeZone: string): { date: string; time: string; minutes: number } {
  let tz = timeZone || "Europe/Rome";
  try {
    // Valida timezone
    Intl.DateTimeFormat("en-US", { timeZone: tz }).format(now);
  } catch {
    tz = "Europe/Rome";
  }

  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = dateParts.find((p) => p.type === "year")?.value ?? "1970";
  const m = dateParts.find((p) => p.type === "month")?.value ?? "01";
  const d = dateParts.find((p) => p.type === "day")?.value ?? "01";

  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(timeParts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(timeParts.find((p) => p.type === "minute")?.value ?? "0");

  return {
    date: `${y}-${m}-${d}`,
    time: `${pad(hour)}:${pad(minute)}`,
    minutes: hour * 60 + minute,
  };
}

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function firedKey(date: string, jobId: string): string {
  return `${date}:${jobId}`;
}

/**
 * Restituisce i job da inviare ora.
 * Finestra ampia (fino a fine giornata locale): adatta al piano Hobby Vercel
 * che può eseguire il cron solo poche volte al giorno.
 */
export function dueJobsForSubscription(
  sub: StoredPushSubscription,
  now = new Date(),
): { job: ReminderJob; fireKey: string }[] {
  const { date, minutes } = localParts(now, sub.timezone);
  const settings = {
    dailyActivity: sub.settings.dailyActivity,
    checkIn: sub.settings.checkIn,
    prayer: sub.settings.prayer,
    weeklyReport: { enabled: false, dayOfWeek: 0, time: "18:00" },
    monthlyReport: { enabled: false, dayOfMonth: 1, time: "18:00" },
  } satisfies NotificationSettings;

  const due: { job: ReminderJob; fireKey: string }[] = [];
  for (const job of buildReminderJobs(settings)) {
    if (!job.enabled) continue;
    const key = firedKey(date, job.id);
    if (sub.fired[key]) continue;
    const scheduled = minutesOf(job.time);
    // Dall'orario previsto fino a fine giornata (catch-up sui cron Hobby)
    if (minutes < scheduled) continue;
    due.push({ job, fireKey: key });
  }
  return due;
}

export function payloadFromJob(job: ReminderJob): PushPayload {
  return {
    title: job.title,
    body: job.body,
    url: job.url,
    tag: `sig-${job.id}`,
  };
}

/** Pulisce chiavi fired più vecchie di 3 giorni. */
export function pruneFired(fired: Record<string, boolean>, today: string): Record<string, boolean> {
  const keepAfter = (() => {
    const [y, m, d] = today.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - 3);
    return dt.toISOString().slice(0, 10);
  })();
  const next: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(fired)) {
    const day = k.split(":")[0] ?? "";
    if (day >= keepAfter) next[k] = v;
  }
  return next;
}
