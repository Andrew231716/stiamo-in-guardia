import type { NotificationSettings } from "@/lib/types";
import { getServiceWorkerRegistration, requestNotificationPermission } from "@/lib/notifications/reminders";

const PUSH_ARMED_KEY = "sig-push-armed";
const PUSH_ENDPOINT_KEY = "sig-push-endpoint";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function werePushRemindersArmed(): boolean {
  try {
    return localStorage.getItem(PUSH_ARMED_KEY) === "1";
  } catch {
    return false;
  }
}

export function getStoredPushEndpoint(): string | null {
  try {
    return localStorage.getItem(PUSH_ENDPOINT_KEY);
  } catch {
    return null;
  }
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Rome";
  } catch {
    return "Europe/Rome";
  }
}

async function fetchPublicKey(): Promise<string | null> {
  const fromEnv = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (fromEnv) return fromEnv;
  try {
    const res = await fetch("/api/push/vapid");
    if (!res.ok) return null;
    const data = (await res.json()) as { publicKey?: string };
    return data.publicKey?.trim() || null;
  } catch {
    return null;
  }
}

export type EnablePushResult =
  | { ok: true; endpoint: string }
  | { ok: false; reason: "unsupported" | "denied" | "no_vapid" | "subscribe_failed" | "server_error" };

export async function enableWebPush(settings: NotificationSettings): Promise<EnablePushResult> {
  if (!isPushSupported()) return { ok: false, reason: "unsupported" };

  const permission = await requestNotificationPermission();
  if (permission === "unsupported") return { ok: false, reason: "unsupported" };
  if (permission !== "granted") return { ok: false, reason: "denied" };

  const publicKey = await fetchPublicKey();
  if (!publicKey) return { ok: false, reason: "no_vapid" };

  const reg = await getServiceWorkerRegistration();
  if (!reg) return { ok: false, reason: "subscribe_failed" };

  let subscription: PushSubscription;
  try {
    subscription =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      }));
  } catch {
    return { ok: false, reason: "subscribe_failed" };
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { ok: false, reason: "subscribe_failed" };
  }

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      timezone: detectTimezone(),
      settings: {
        dailyActivity: settings.dailyActivity,
        checkIn: settings.checkIn,
        prayer: settings.prayer,
      },
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    }),
  });

  if (!res.ok) return { ok: false, reason: "server_error" };

  try {
    localStorage.setItem(PUSH_ARMED_KEY, "1");
    localStorage.setItem(PUSH_ENDPOINT_KEY, json.endpoint);
  } catch {
    /* ignore */
  }

  return { ok: true, endpoint: json.endpoint };
}

export async function syncPushSettings(settings: NotificationSettings): Promise<boolean> {
  if (!werePushRemindersArmed()) return false;
  const endpoint = getStoredPushEndpoint();
  if (!endpoint) return false;
  try {
    const res = await fetch("/api/push/subscribe", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint,
        timezone: detectTimezone(),
        settings: {
          dailyActivity: settings.dailyActivity,
          checkIn: settings.checkIn,
          prayer: settings.prayer,
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function disableWebPush(): Promise<boolean> {
  const endpoint = getStoredPushEndpoint();
  const reg = await getServiceWorkerRegistration();
  const existing = await reg?.pushManager.getSubscription();

  if (endpoint) {
    try {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
    } catch {
      /* ignore */
    }
  }

  try {
    await existing?.unsubscribe();
  } catch {
    /* ignore */
  }

  try {
    localStorage.removeItem(PUSH_ARMED_KEY);
    localStorage.removeItem(PUSH_ENDPOINT_KEY);
  } catch {
    /* ignore */
  }

  return true;
}

export async function sendPushTestNotification(
  settings: NotificationSettings,
): Promise<"ok" | "denied" | "unsupported" | "error"> {
  const enabled = await enableWebPush(settings);
  if (!enabled.ok) {
    if (enabled.reason === "unsupported") return "unsupported";
    if (enabled.reason === "denied") return "denied";
    return "error";
  }

  try {
    const res = await fetch("/api/push/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: enabled.endpoint }),
    });
    if (!res.ok) return "error";
    const data = (await res.json()) as { ok?: boolean };
    return data.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}
