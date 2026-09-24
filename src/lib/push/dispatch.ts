import { configureWebPush, webpush } from "@/lib/push/vapid";
import { dueJobsForSubscription, localParts, payloadFromJob, pruneFired } from "@/lib/push/due";
import { readPushStore, writePushStore } from "@/lib/push/store";
import type { PushPayload, StoredPushSubscription } from "@/lib/push/types";

export interface DispatchResult {
  checked: number;
  sent: number;
  removed: number;
  errors: number;
}

async function sendOne(sub: StoredPushSubscription, payload: PushPayload): Promise<"ok" | "gone" | "error"> {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: sub.keys,
      },
      JSON.stringify(payload),
      {
        TTL: 60 * 60 * 12,
        urgency: "normal",
      },
    );
    return "ok";
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    if (status === 404 || status === 410) return "gone";
    return "error";
  }
}

export async function dispatchDuePushNotifications(now = new Date()): Promise<DispatchResult> {
  if (!configureWebPush()) {
    return { checked: 0, sent: 0, removed: 0, errors: 1 };
  }

  const store = await readPushStore();
  let sent = 0;
  let removed = 0;
  let errors = 0;
  const kept: StoredPushSubscription[] = [];

  for (const sub of store.subscriptions) {
    const local = localParts(now, sub.timezone);
    let fired = pruneFired(sub.fired, local.date);
    let drop = false;

    for (const { job, fireKey } of dueJobsForSubscription({ ...sub, fired }, now)) {
      const result = await sendOne(sub, payloadFromJob(job));
      if (result === "ok") {
        fired = { ...fired, [fireKey]: true };
        sent += 1;
      } else if (result === "gone") {
        drop = true;
        removed += 1;
        break;
      } else {
        errors += 1;
      }
    }

    if (!drop) {
      kept.push({ ...sub, fired, updatedAt: new Date().toISOString() });
    }
  }

  if (kept.length !== store.subscriptions.length || sent > 0 || removed > 0) {
    await writePushStore({ version: 1, subscriptions: kept });
  }

  return { checked: store.subscriptions.length, sent, removed, errors };
}
