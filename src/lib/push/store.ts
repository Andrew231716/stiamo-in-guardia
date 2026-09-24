import { get, put } from "@vercel/blob";
import type { PushStoreFile, StoredPushSubscription } from "@/lib/push/types";

const BLOB_PATH = "push/subscriptions.json";

const EMPTY: PushStoreFile = { version: 1, subscriptions: [] };

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const res = new Response(stream);
  return res.text();
}

export async function readPushStore(): Promise<PushStoreFile> {
  if (!hasBlobToken()) return EMPTY;
  try {
    const result = await get(BLOB_PATH, { access: "private", useCache: false });
    if (!result?.stream) return EMPTY;
    const raw = await streamToText(result.stream);
    if (!raw.trim()) return EMPTY;
    const data = JSON.parse(raw) as PushStoreFile;
    if (!data || data.version !== 1 || !Array.isArray(data.subscriptions)) return EMPTY;
    return data;
  } catch {
    return EMPTY;
  }
}

export async function writePushStore(store: PushStoreFile): Promise<void> {
  if (!hasBlobToken()) {
    throw new Error("BLOB_READ_WRITE_TOKEN mancante");
  }
  await put(BLOB_PATH, JSON.stringify(store), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function upsertSubscription(
  entry: Omit<StoredPushSubscription, "fired" | "updatedAt"> & {
    fired?: Record<string, boolean>;
  },
): Promise<StoredPushSubscription> {
  const store = await readPushStore();
  const existing = store.subscriptions.find((s) => s.endpoint === entry.endpoint);
  const next: StoredPushSubscription = {
    id: existing?.id ?? entry.id,
    endpoint: entry.endpoint,
    keys: entry.keys,
    timezone: entry.timezone,
    settings: entry.settings,
    fired: entry.fired ?? existing?.fired ?? {},
    updatedAt: new Date().toISOString(),
    userAgent: entry.userAgent ?? existing?.userAgent,
  };
  store.subscriptions = [
    ...store.subscriptions.filter((s) => s.endpoint !== entry.endpoint),
    next,
  ];
  await writePushStore(store);
  return next;
}

export async function removeSubscription(endpoint: string): Promise<boolean> {
  const store = await readPushStore();
  const before = store.subscriptions.length;
  store.subscriptions = store.subscriptions.filter((s) => s.endpoint !== endpoint);
  if (store.subscriptions.length === before) return false;
  await writePushStore(store);
  return true;
}

export async function patchSubscription(
  endpoint: string,
  patch: Partial<Pick<StoredPushSubscription, "settings" | "timezone" | "fired">>,
): Promise<StoredPushSubscription | null> {
  const store = await readPushStore();
  const idx = store.subscriptions.findIndex((s) => s.endpoint === endpoint);
  if (idx < 0) return null;
  const current = store.subscriptions[idx];
  const next: StoredPushSubscription = {
    ...current,
    ...patch,
    settings: patch.settings ?? current.settings,
    fired: patch.fired ?? current.fired,
    updatedAt: new Date().toISOString(),
  };
  store.subscriptions[idx] = next;
  await writePushStore(store);
  return next;
}
