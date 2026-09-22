import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  AppData,
  DailyActivityRecord,
  DailyCheckin,
  IfThenPlan,
  PrayerEntry,
  StoredReport,
  StrategyItem,
  UserPreferences,
} from "@/lib/types";
import { DEFAULT_PREFERENCES } from "@/lib/types";

const DB_NAME = "stiamo-in-guardia";
const DB_VERSION = 1;
const STORE = "app";
const KEY = "data";
const DATA_VERSION = 1;

interface SigDB extends DBSchema {
  app: {
    key: string;
    value: AppData;
  };
}

function emptyData(): AppData {
  return {
    version: DATA_VERSION,
    preferences: { ...DEFAULT_PREFERENCES, notificationSettings: { ...DEFAULT_PREFERENCES.notificationSettings } },
    activities: [],
    checkins: [],
    prayers: [],
    ifThenPlans: [],
    customStrategies: [],
    reports: [],
    activityHistoryIds: [],
  };
}

let dbPromise: Promise<IDBPDatabase<SigDB>> | null = null;

function getDb() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB disponibile solo nel browser");
  }
  if (!dbPromise) {
    dbPromise = openDB<SigDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

export async function loadAppData(): Promise<AppData> {
  const db = await getDb();
  const data = await db.get(STORE, KEY);
  if (!data) {
    const fresh = emptyData();
    await db.put(STORE, fresh, KEY);
    return fresh;
  }
  return {
    ...emptyData(),
    ...data,
    preferences: { ...DEFAULT_PREFERENCES, ...data.preferences },
  };
}

export async function saveAppData(data: AppData): Promise<void> {
  const db = await getDb();
  await db.put(STORE, { ...data, version: DATA_VERSION }, KEY);
}

export async function updateAppData(mutator: (data: AppData) => AppData): Promise<AppData> {
  const current = await loadAppData();
  const next = mutator(current);
  await saveAppData(next);
  return next;
}

export async function exportAppDataJson(): Promise<string> {
  const data = await loadAppData();
  return JSON.stringify(data, null, 2);
}

export async function importAppDataJson(json: string): Promise<AppData> {
  const parsed = JSON.parse(json) as AppData;
  if (!parsed || typeof parsed !== "object") throw new Error("Formato non valido");
  const merged: AppData = {
    ...emptyData(),
    ...parsed,
    preferences: { ...DEFAULT_PREFERENCES, ...(parsed.preferences ?? {}) },
    activities: parsed.activities ?? [],
    checkins: parsed.checkins ?? [],
    prayers: parsed.prayers ?? [],
    ifThenPlans: parsed.ifThenPlans ?? [],
    customStrategies: parsed.customStrategies ?? [],
    reports: parsed.reports ?? [],
    activityHistoryIds: parsed.activityHistoryIds ?? [],
  };
  await saveAppData(merged);
  return merged;
}

export async function deleteAllData(): Promise<AppData> {
  const fresh = emptyData();
  await saveAppData(fresh);
  return fresh;
}

export type {
  AppData,
  DailyActivityRecord,
  DailyCheckin,
  IfThenPlan,
  PrayerEntry,
  StoredReport,
  StrategyItem,
  UserPreferences,
};
