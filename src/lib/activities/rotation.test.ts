import { describe, expect, it } from "vitest";
import {
  pickNextCategory,
  createDailyActivity,
  replaceActivityForDate,
} from "@/lib/activities/rotation";
import { ACTIVITY_CATEGORIES } from "@/lib/types";
import { ACTIVITY_LIBRARY } from "@/data/activities";
import { streakWithoutEpisodes } from "@/lib/utils/labels";

describe("activity rotation", () => {
  it("has at least 60 activities across 7 categories", () => {
    expect(ACTIVITY_LIBRARY.length).toBeGreaterThanOrEqual(60);
    for (const cat of ACTIVITY_CATEGORIES) {
      expect(ACTIVITY_LIBRARY.some((a) => a.category === cat)).toBe(true);
    }
  });

  it("avoids repeating recent categories when possible", () => {
    const recent = ACTIVITY_CATEGORIES.slice(0, 3);
    const next = pickNextCategory(recent);
    expect(recent).not.toContain(next);
  });

  it("creates a well-formed daily activity", () => {
    const activity = createDailyActivity("2026-03-22", [], []);
    expect(activity.title).toBeTruthy();
    expect(activity.durationMinutes).toBeGreaterThanOrEqual(5);
    expect(activity.scriptureReferences.length).toBeGreaterThan(0);
    expect(activity.instructions.length).toBeGreaterThan(0);
    expect(activity.dailyAction).toBeTruthy();
  });

  it("does not repeat the same template across many consecutive days when library allows", () => {
    const generated = [];
    for (let i = 0; i < 10; i++) {
      const a = createDailyActivity(`2026-03-${String(i + 1).padStart(2, "0")}`, generated, []);
      generated.push(a);
    }
    const ids = generated.map((a) => a.templateId);
    expect(new Set(ids).size).toBeGreaterThan(5);
  });

  it("replaceActivityForDate yields a different template when possible", () => {
    const first = createDailyActivity("2026-03-22", [], []);
    const { activity: second } = replaceActivityForDate("2026-03-22", [first], []);
    expect(second.date).toBe("2026-03-22");
    if (ACTIVITY_LIBRARY.length > 1) {
      expect(second.templateId).not.toBe(first.templateId);
    }
  });
});

describe("streakWithoutEpisodes", () => {
  it("counts consecutive clean check-ins from most recent", () => {
    const streak = streakWithoutEpisodes(
      [
        { date: "2026-03-20", pornographyStatus: "none", masturbationStatus: "none" },
        { date: "2026-03-21", pornographyStatus: "none", masturbationStatus: "none" },
        { date: "2026-03-22", pornographyStatus: "episode", masturbationStatus: "none" },
        { date: "2026-03-23", pornographyStatus: "none", masturbationStatus: "none" },
        { date: "2026-03-24", pornographyStatus: "none", masturbationStatus: "none" },
      ],
      { countPornography: true, countMasturbation: true },
    );
    expect(streak).toBe(2);
  });
});
