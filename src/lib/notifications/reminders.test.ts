import { describe, expect, it, beforeEach, vi } from "vitest";
import { buildReminderJobs, getOverdueReminderJobs } from "@/lib/notifications/reminders";
import { DEFAULT_NOTIFICATION_SETTINGS } from "@/lib/types";

describe("reminders", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
  });

  it("builds three reminder jobs from settings", () => {
    const jobs = buildReminderJobs(DEFAULT_NOTIFICATION_SETTINGS);
    expect(jobs).toHaveLength(3);
    expect(jobs.map((j) => j.id)).toEqual(["dailyActivity", "checkIn", "prayer"]);
  });

  it("reports overdue jobs after their scheduled minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 22, 10, 0, 0));
    const settings = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      dailyActivity: { enabled: true, time: "08:00" },
      checkIn: { enabled: true, time: "09:00" },
      prayer: { enabled: true, time: "21:00" },
    };
    const overdue = getOverdueReminderJobs(settings);
    expect(overdue.map((j) => j.id)).toEqual(["dailyActivity", "checkIn"]);
    vi.useRealTimers();
  });
});
