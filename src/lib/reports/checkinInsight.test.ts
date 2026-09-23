import { describe, expect, it } from "vitest";
import { buildCheckinInsight } from "@/lib/reports/checkinInsight";
import {
  buildMonthlyHabitAssessment,
  computeRiskScore,
} from "@/lib/reports/monthlyAssessment";
import { DEFAULT_PREFERENCES, type DailyCheckin } from "@/lib/types";

function checkin(partial: Partial<DailyCheckin> & { date: string }): DailyCheckin {
  return {
    id: partial.id ?? partial.date,
    date: partial.date,
    pornographyStatus: partial.pornographyStatus ?? "none",
    masturbationStatus: partial.masturbationStatus ?? "none",
    involuntaryImpulseStatus: partial.involuntaryImpulseStatus ?? "no",
    triggers: partial.triggers ?? [],
    chainStage: partial.chainStage ?? "not_applicable",
    strategiesUsed: partial.strategiesUsed ?? [],
    smallVictory: partial.smallVictory,
    improvementNote: partial.improvementNote,
    prayerCompleted: partial.prayerCompleted ?? null,
    notes: partial.notes,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  };
}

describe("buildCheckinInsight", () => {
  it("suggests earlier break points when the chain reached search", () => {
    const insight = buildCheckinInsight({
      pornographyStatus: "episode",
      masturbationStatus: "none",
      involuntaryImpulseStatus: "yes",
      triggers: ["boredom", "phone_nearby"],
      chainStage: "search",
      strategiesUsed: [],
      prayerCompleted: false,
    });
    expect(insight.tone).toBe("learning");
    expect(insight.earlierBreakPoints.length).toBeGreaterThan(0);
    expect(insight.suggestedActions.length).toBeGreaterThan(0);
    expect(insight.daySeverity).toBe("elevated");
  });

  it("celebrates early interruption without episode", () => {
    const insight = buildCheckinInsight({
      pornographyStatus: "none",
      masturbationStatus: "none",
      involuntaryImpulseStatus: "yes",
      triggers: ["stress"],
      chainStage: "interrupted_early",
      strategiesUsed: ["put_phone_away"],
      smallVictory: "Ho posato il telefono",
      prayerCompleted: true,
    });
    expect(insight.tone).toBe("victory");
    expect(insight.daySeverity).toBe("none");
  });
});

describe("monthly habit assessment", () => {
  it("computes risk and direction across months", () => {
    const prefs = DEFAULT_PREFERENCES;
    const previous = [
      checkin({ date: "2026-02-02", pornographyStatus: "episode", chainStage: "action" }),
      checkin({ date: "2026-02-05", pornographyStatus: "episode", chainStage: "search" }),
      checkin({ date: "2026-02-10", pornographyStatus: "episode", chainStage: "action" }),
      checkin({ date: "2026-02-15", pornographyStatus: "episode", masturbationStatus: "episode", chainStage: "action" }),
    ];
    const current = [
      checkin({
        date: "2026-03-02",
        pornographyStatus: "none",
        strategiesUsed: ["pray"],
        prayerCompleted: true,
        smallVictory: "ok",
      }),
      checkin({
        date: "2026-03-05",
        pornographyStatus: "none",
        chainStage: "interrupted_early",
        strategiesUsed: ["put_phone_away"],
      }),
      checkin({ date: "2026-03-08", pornographyStatus: "none", prayerCompleted: true }),
      checkin({
        date: "2026-03-12",
        pornographyStatus: "episode",
        chainStage: "impulse",
        strategiesUsed: ["change_room"],
      }),
    ];

    const prevScore = computeRiskScore(previous, prefs);
    const currScore = computeRiskScore(current, prefs);
    expect(prevScore).not.toBeNull();
    expect(currScore).not.toBeNull();
    expect(currScore!).toBeLessThan(prevScore!);

    const assessment = buildMonthlyHabitAssessment({
      checkins: [...previous, ...current],
      preferences: prefs,
      startDate: "2026-03-01",
      endDate: "2026-03-31",
    });
    expect(assessment.insufficientData).toBe(false);
    expect(assessment.riskDirection).toBe("improving");
    expect(assessment.series.length).toBeGreaterThan(0);
    expect(assessment.severityBand).not.toBe("insufficient");
  });
});
