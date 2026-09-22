"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { v4 as uuid } from "uuid";
import {
  deleteAllData,
  exportAppDataJson,
  importAppDataJson,
  loadAppData,
  saveAppData,
  type AppData,
} from "@/lib/storage/local";
import type {
  DailyActivityRecord,
  DailyCheckin,
  IfThenPlan,
  PrayerEntry,
  StrategyItem,
  UserPreferences,
} from "@/lib/types";
import { DEFAULT_PREFERENCES } from "@/lib/types";
import { ensureActivityForDate, replaceActivityForDate } from "@/lib/activities/rotation";
import { todayIso, yesterdayIso } from "@/lib/utils/date";
import { pickPrayerVerseForDate } from "@/data/verses";

interface AppContextValue {
  ready: boolean;
  data: AppData;
  isPending: boolean;
  refresh: () => Promise<void>;
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>;
  ensureTodayActivity: () => Promise<DailyActivityRecord>;
  replaceTodayActivity: () => Promise<DailyActivityRecord>;
  saveActivityProgress: (
    id: string,
    patch: Partial<Pick<DailyActivityRecord, "personalResponse" | "reflectionAnswer" | "completedAt">>,
  ) => Promise<void>;
  upsertCheckin: (checkin: Omit<DailyCheckin, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<DailyCheckin>;
  deleteCheckin: (id: string) => Promise<void>;
  upsertPrayer: (patch: Partial<PrayerEntry> & { date: string }) => Promise<PrayerEntry>;
  upsertIfThenPlan: (plan: Omit<IfThenPlan, "id" | "createdAt"> & { id?: string }) => Promise<void>;
  deleteIfThenPlan: (id: string) => Promise<void>;
  upsertCustomStrategy: (strategy: Omit<StrategyItem, "id"> & { id?: string }) => Promise<void>;
  deleteCustomStrategy: (id: string) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<void>;
  wipeData: () => Promise<void>;
  getCheckinForDate: (date: string) => DailyCheckin | undefined;
  getActivityForDate: (date: string) => DailyActivityRecord | undefined;
  getPrayerForDate: (date: string) => PrayerEntry | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>({
    version: 1,
    preferences: DEFAULT_PREFERENCES,
    activities: [],
    checkins: [],
    prayers: [],
    ifThenPlans: [],
    customStrategies: [],
    reports: [],
    activityHistoryIds: [],
  });
  const [isPending, startTransition] = useTransition();

  const persist = useCallback(async (next: AppData) => {
    await saveAppData(next);
    startTransition(() => setData(next));
  }, []);

  const refresh = useCallback(async () => {
    const loaded = await loadAppData();
    startTransition(() => {
      setData(loaded);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await loadAppData();
      if (!alive) return;
      startTransition(() => {
        setData(loaded);
        setReady(true);
      });
    })();
    return () => {
      alive = false;
    };
  }, []);

  const updatePreferences = useCallback(
    async (patch: Partial<UserPreferences>) => {
      const next = {
        ...data,
        preferences: {
          ...data.preferences,
          ...patch,
          notificationSettings: {
            ...data.preferences.notificationSettings,
            ...(patch.notificationSettings ?? {}),
          },
          relapseDefinition: {
            ...data.preferences.relapseDefinition,
            ...(patch.relapseDefinition ?? {}),
          },
        },
      };
      await persist(next);
    },
    [data, persist],
  );

  const ensureTodayActivity = useCallback(async () => {
    const date = todayIso();
    const result = ensureActivityForDate(date, data.activities, data.checkins);
    if (result.created) {
      const next = {
        ...data,
        activities: result.activities,
        activityHistoryIds: [...data.activityHistoryIds, result.activity.templateId].slice(-60),
      };
      await persist(next);
    }
    return result.activity;
  }, [data, persist]);

  const replaceTodayActivity = useCallback(async () => {
    const date = todayIso();
    const result = replaceActivityForDate(date, data.activities, data.checkins);
    const next = {
      ...data,
      activities: result.activities,
      activityHistoryIds: [...data.activityHistoryIds, result.activity.templateId].slice(-60),
    };
    await persist(next);
    return result.activity;
  }, [data, persist]);

  const saveActivityProgress = useCallback(
    async (
      id: string,
      patch: Partial<Pick<DailyActivityRecord, "personalResponse" | "reflectionAnswer" | "completedAt">>,
    ) => {
      const next = {
        ...data,
        activities: data.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      };
      await persist(next);
    },
    [data, persist],
  );

  const upsertCheckin = useCallback(
    async (input: Omit<DailyCheckin, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
      const now = new Date().toISOString();
      const existing = input.id
        ? data.checkins.find((c) => c.id === input.id)
        : data.checkins.find((c) => c.date === input.date);
      const record: DailyCheckin = {
        id: existing?.id ?? uuid(),
        date: input.date,
        pornographyStatus: input.pornographyStatus,
        masturbationStatus: input.masturbationStatus,
        involuntaryImpulseStatus: input.involuntaryImpulseStatus,
        triggers: input.triggers,
        chainStage: input.chainStage,
        strategiesUsed: input.strategiesUsed,
        smallVictory: input.smallVictory,
        improvementNote: input.improvementNote,
        prayerCompleted: input.prayerCompleted,
        notes: input.notes,
        preventiveAdjustment: input.preventiveAdjustment,
        interruptionPoint: input.interruptionPoint,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      const checkins = existing
        ? data.checkins.map((c) => (c.id === existing.id ? record : c))
        : [...data.checkins, record];
      await persist({ ...data, checkins });
      return record;
    },
    [data, persist],
  );

  const deleteCheckin = useCallback(
    async (id: string) => {
      await persist({ ...data, checkins: data.checkins.filter((c) => c.id !== id) });
    },
    [data, persist],
  );

  const upsertPrayer = useCallback(
    async (patch: Partial<PrayerEntry> & { date: string }) => {
      const existing = data.prayers.find((p) => p.date === patch.date);
      const verse = pickPrayerVerseForDate(patch.date);
      const now = new Date().toISOString();
      const record: PrayerEntry = {
        id: existing?.id ?? uuid(),
        date: patch.date,
        verseReference: patch.verseReference ?? existing?.verseReference ?? verse.reference,
        writtenPrayer: patch.writtenPrayer ?? existing?.writtenPrayer,
        feelingNote: patch.feelingNote ?? existing?.feelingNote,
        completed: patch.completed ?? existing?.completed ?? false,
        completedAt: patch.completed
          ? patch.completedAt ?? now
          : patch.completed === false
            ? undefined
            : existing?.completedAt,
        createdAt: existing?.createdAt ?? now,
      };
      const prayers = existing
        ? data.prayers.map((p) => (p.date === patch.date ? record : p))
        : [...data.prayers, record];
      await persist({ ...data, prayers });
      return record;
    },
    [data, persist],
  );

  const upsertIfThenPlan = useCallback(
    async (plan: Omit<IfThenPlan, "id" | "createdAt"> & { id?: string }) => {
      const existing = plan.id ? data.ifThenPlans.find((p) => p.id === plan.id) : undefined;
      const record: IfThenPlan = {
        id: existing?.id ?? uuid(),
        ifCondition: plan.ifCondition,
        thenAction: plan.thenAction,
        active: plan.active,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };
      const ifThenPlans = existing
        ? data.ifThenPlans.map((p) => (p.id === existing.id ? record : p))
        : [...data.ifThenPlans, record];
      await persist({ ...data, ifThenPlans });
    },
    [data, persist],
  );

  const deleteIfThenPlan = useCallback(
    async (id: string) => {
      await persist({ ...data, ifThenPlans: data.ifThenPlans.filter((p) => p.id !== id) });
    },
    [data, persist],
  );

  const upsertCustomStrategy = useCallback(
    async (strategy: Omit<StrategyItem, "id"> & { id?: string }) => {
      const existing = strategy.id ? data.customStrategies.find((s) => s.id === strategy.id) : undefined;
      const record: StrategyItem = {
        id: existing?.id ?? uuid(),
        name: strategy.name,
        description: strategy.description,
        category: strategy.category || "custom",
      };
      const customStrategies = existing
        ? data.customStrategies.map((s) => (s.id === existing.id ? record : s))
        : [...data.customStrategies, record];
      await persist({ ...data, customStrategies });
    },
    [data, persist],
  );

  const deleteCustomStrategy = useCallback(
    async (id: string) => {
      await persist({ ...data, customStrategies: data.customStrategies.filter((s) => s.id !== id) });
    },
    [data, persist],
  );

  const exportData = useCallback(async () => exportAppDataJson(), []);
  const importData = useCallback(
    async (json: string) => {
      const imported = await importAppDataJson(json);
      setData(imported);
    },
    [],
  );
  const wipeData = useCallback(async () => {
    const fresh = await deleteAllData();
    setData(fresh);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      data,
      isPending,
      refresh,
      updatePreferences,
      ensureTodayActivity,
      replaceTodayActivity,
      saveActivityProgress,
      upsertCheckin,
      deleteCheckin,
      upsertPrayer,
      upsertIfThenPlan,
      deleteIfThenPlan,
      upsertCustomStrategy,
      deleteCustomStrategy,
      exportData,
      importData,
      wipeData,
      getCheckinForDate: (date: string) => data.checkins.find((c) => c.date === date),
      getActivityForDate: (date: string) => data.activities.find((a) => a.date === date),
      getPrayerForDate: (date: string) => data.prayers.find((p) => p.date === date),
    }),
    [
      ready,
      data,
      isPending,
      refresh,
      updatePreferences,
      ensureTodayActivity,
      replaceTodayActivity,
      saveActivityProgress,
      upsertCheckin,
      deleteCheckin,
      upsertPrayer,
      upsertIfThenPlan,
      deleteIfThenPlan,
      upsertCustomStrategy,
      deleteCustomStrategy,
      exportData,
      importData,
      wipeData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve essere usato dentro AppProvider");
  return ctx;
}

export function useYesterdayCheckinNeeded() {
  const { data, ready } = useApp();
  const yesterday = yesterdayIso();
  const exists = data.checkins.some((c) => c.date === yesterday);
  return { ready, yesterday, needed: ready && !exists };
}
