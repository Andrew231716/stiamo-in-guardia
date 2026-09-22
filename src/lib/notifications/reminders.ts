import type { NotificationSettings } from "@/lib/types";

const reminderTimers: number[] = [];

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

function msUntilTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

function clearTimers() {
  for (const id of reminderTimers) window.clearTimeout(id);
  reminderTimers.length = 0;
}

/**
 * Programma promemoria locali nella sessione corrente del browser.
 * Non dichiara invii se il permesso non è concesso.
 */
export function scheduleLocalReminders(settings: NotificationSettings): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  clearTimers();

  const jobs: Array<{ enabled: boolean; time: string; title: string; body: string }> = [
    {
      enabled: settings.dailyActivity.enabled,
      time: settings.dailyActivity.time,
      title: "Stiamo in guardia",
      body: "È il momento della tua breve attività quotidiana.",
    },
    {
      enabled: settings.checkIn.enabled,
      time: settings.checkIn.time,
      title: "Stiamo in guardia",
      body: "Se vuoi, puoi registrare il giorno precedente.",
    },
    {
      enabled: settings.prayer.enabled,
      time: settings.prayer.time,
      title: "Stiamo in guardia",
      body: "Un momento quieto può aiutare: fermati e prega col cuore.",
    },
  ];

  for (const job of jobs) {
    if (!job.enabled) continue;
    const delay = msUntilTime(job.time);
    const id = window.setTimeout(() => {
      new Notification(job.title, { body: job.body, silent: true });
      // riprogramma il giorno successivo
      scheduleLocalReminders(settings);
    }, delay);
    reminderTimers.push(id);
  }
  return true;
}
