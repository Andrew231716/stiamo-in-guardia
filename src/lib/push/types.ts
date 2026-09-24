import type { NotificationSettings } from "@/lib/types";

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface StoredPushSubscription {
  id: string;
  endpoint: string;
  keys: PushSubscriptionKeys;
  timezone: string;
  settings: Pick<NotificationSettings, "dailyActivity" | "checkIn" | "prayer">;
  /** Keys like "2026-03-24:dailyActivity" → already sent */
  fired: Record<string, boolean>;
  updatedAt: string;
  userAgent?: string;
}

export interface PushStoreFile {
  version: 1;
  subscriptions: StoredPushSubscription[];
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
}
