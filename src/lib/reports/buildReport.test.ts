import { describe, expect, it } from "vitest";
import { buildReport } from "@/lib/reports/buildReport";
import { DEFAULT_PREFERENCES } from "@/lib/types";
import type { DailyCheckin } from "@/lib/types";

function checkin(partial: Partial<DailyCheckin> & { date: string }): DailyCheckin {
  return {
    id: partial.date,
    pornographyStatus: "none",
    masturbationStatus: "none",
    involuntaryImpulseStatus: "yes",
    triggers: [],
    chainStage: "not_applicable",
    strategiesUsed: [],
    prayerCompleted: false,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
    ...partial,
  };
}

describe("buildReport", () => {
  it("does not count involuntary impulses as relapses", () => {
    const report = buildReport({
      periodType: "weekly",
      startDate: "2026-03-16",
      endDate: "2026-03-22",
      checkins: [
        checkin({ date: "2026-03-16", involuntaryImpulseStatus: "yes" }),
        checkin({ date: "2026-03-17", involuntaryImpulseStatus: "yes" }),
        checkin({ date: "2026-03-18", involuntaryImpulseStatus: "yes" }),
      ],
      activities: [],
      prayers: [],
      preferences: DEFAULT_PREFERENCES,
    });
    expect(report.pornographyEpisodes).toBe(0);
    expect(report.masturbationEpisodes).toBe(0);
    expect(report.daysWithoutEpisodes).toBe(3);
  });

  it("marks insufficient data and does not invent clean days", () => {
    const report = buildReport({
      periodType: "weekly",
      startDate: "2026-03-16",
      endDate: "2026-03-22",
      checkins: [checkin({ date: "2026-03-16" })],
      activities: [],
      prayers: [],
      preferences: DEFAULT_PREFERENCES,
    });
    expect(report.insufficientData).toBe(true);
    expect(report.daysWithoutEpisodes).toBeNull();
  });

  it("counts recorded episodes separately", () => {
    const report = buildReport({
      periodType: "weekly",
      startDate: "2026-03-16",
      endDate: "2026-03-22",
      checkins: [
        checkin({ date: "2026-03-16", pornographyStatus: "episode", triggers: ["boredom"] }),
        checkin({ date: "2026-03-17", masturbationStatus: "episode", triggers: ["boredom"] }),
        checkin({ date: "2026-03-18" }),
      ],
      activities: [],
      prayers: [],
      preferences: DEFAULT_PREFERENCES,
    });
    expect(report.pornographyEpisodes).toBe(1);
    expect(report.masturbationEpisodes).toBe(1);
    expect(report.topTriggers[0]?.name).toBe("Noia");
  });
});
