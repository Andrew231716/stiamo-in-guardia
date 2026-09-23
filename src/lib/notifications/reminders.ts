import type { NotificationSettings } from "@/lib/types";

const FIRED_PREFIX = "sig-notif-fired:";
const ARMED_KEY = "sig-notif-armed";

export type ReminderJobId = "dailyActivity" | "checkIn" | "prayer";

export interface ReminderJob {
  id: ReminderJobId;
  enabled: boolean;
  time: string;
  title: string;
  body: string;
  url: string;
}

let pollTimer: number | null = null;

export function buildReminderJobs(settings: NotificationSettings): ReminderJob[] {
  return [
    {
      id: "dailyActivity",
      enabled: settings.dailyActivity.enabled,
      time: settings.dailyActivity.time,
      title: "Stiamo in guardia",
      body: "È il momento della tua breve attività quotidiana.",
      url: "/attivita",
    },
    {
      id: "checkIn",
      enabled: settings.checkIn.enabled,
      time: settings.checkIn.time,
      title: "Stiamo in guardia",
      body: "Se vuoi, puoi registrare il giorno precedente.",
      url: "/check-in",
    },
    {
      id: "prayer",
      enabled: settings.prayer.enabled,
      time: settings.prayer.time,
      title: "Stiamo in guardia",
      body: "Un momento quieto può aiutare: fermati e prega col cuore.",
      url: "/preghiera",
    },
  ];
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function todayIsoLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function firedKey(jobId: ReminderJobId, day = todayIsoLocal()): string {
  return `${FIRED_PREFIX}${day}:${jobId}`;
}

function hasFired(jobId: ReminderJobId): boolean {
  try {
    return localStorage.getItem(firedKey(jobId)) === "1";
  } catch {
    return false;
  }
}

function markFired(jobId: ReminderJobId): void {
  try {
    localStorage.setItem(firedKey(jobId), "1");
  } catch {
    /* ignore quota */
  }
}

/** Minuti dall'inizio della giornata per "HH:MM". */
function minutesOfDay(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export async function showAppNotification(job: Pick<ReminderJob, "id" | "title" | "body" | "url">): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const options: NotificationOptions & { renotify?: boolean } = {
    body: job.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: `sig-${job.id}`,
    renotify: true,
    silent: false,
    data: { url: job.url },
  };

  const reg = await getServiceWorkerRegistration();
  if (reg?.showNotification) {
    await reg.showNotification(job.title, options);
    return true;
  }

  new Notification(job.title, options);
  return true;
}

export async function sendTestNotification(): Promise<"ok" | "denied" | "unsupported" | "error"> {
  const permission = await requestNotificationPermission();
  if (permission === "unsupported") return "unsupported";
  if (permission !== "granted") return "denied";
  try {
    const ok = await showAppNotification({
      id: "dailyActivity",
      title: "Stiamo in guardia",
      body: "Notifica di prova: se la vedi, i promemoria possono funzionare su questo dispositivo.",
      url: "/",
    });
    return ok ? "ok" : "error";
  } catch {
    return "error";
  }
}

/**
 * Controlla i promemoria dovuti (orario raggiunto oggi e non ancora inviati).
 * Funziona anche come «catch-up» quando riapri l'app.
 */
export async function flushDueReminders(settings: NotificationSettings): Promise<number> {
  if (typeof window === "undefined" || !("Notification" in window)) return 0;
  if (Notification.permission !== "granted") return 0;

  const now = nowMinutes();
  let sent = 0;
  for (const job of buildReminderJobs(settings)) {
    if (!job.enabled) continue;
    if (hasFired(job.id)) continue;
    const due = minutesOfDay(job.time);
    // Finestra: dall'orario previsto fino a fine giornata (catch-up se l'app era chiusa)
    if (now < due) continue;
    const ok = await showAppNotification(job);
    if (ok) {
      markFired(job.id);
      sent += 1;
    }
  }
  return sent;
}

function stopPolling(): void {
  if (pollTimer != null) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
}

/**
 * Attiva il controllo ogni minuto + un flush immediato.
 * I timer lunghi (setTimeout di molte ore) su mobile vengono spesso congelati:
 * il poll è più affidabile finché l'app/PWA resta in memoria.
 */
export async function scheduleLocalReminders(settings: NotificationSettings): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  stopPolling();
  await flushDueReminders(settings);

  pollTimer = window.setInterval(() => {
    void flushDueReminders(settings);
  }, 30_000);

  try {
    localStorage.setItem(ARMED_KEY, "1");
  } catch {
    /* ignore */
  }

  const reg = await getServiceWorkerRegistration();
  reg?.active?.postMessage({
    type: "SIG_REMINDERS",
    jobs: buildReminderJobs(settings).filter((j) => j.enabled),
  });

  return true;
}

export function stopLocalReminders(): void {
  stopPolling();
  try {
    localStorage.removeItem(ARMED_KEY);
  } catch {
    /* ignore */
  }
}

export function wereRemindersArmed(): boolean {
  try {
    return localStorage.getItem(ARMED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markReminderHandled(jobId: ReminderJobId): void {
  markFired(jobId);
}

/** Promemoria già scaduti oggi ma non ancora mostrati/gestiti (per banner in-app). */
export function getOverdueReminderJobs(settings: NotificationSettings): ReminderJob[] {
  const now = nowMinutes();
  return buildReminderJobs(settings).filter((job) => {
    if (!job.enabled) return false;
    if (hasFired(job.id)) return false;
    return now >= minutesOfDay(job.time);
  });
}
