import { describe, expect, it } from "vitest";
import { buildLocalActivityCoach, buildLocalCheckinCoach } from "@/lib/ai/localCoach";

describe("local AI coach", () => {
  it("builds check-in coaching with official sources", () => {
    const result = buildLocalCheckinCoach({
      kind: "checkin",
      date: "2026-03-22",
      pornographyStatus: "episode",
      masturbationStatus: "none",
      involuntaryImpulseStatus: "yes",
      triggers: ["boredom", "phone_nearby"],
      chainStage: "search",
      strategiesUsed: [],
      prayerCompleted: false,
      improvementNote: "Voglio posare il telefono prima",
    });
    expect(result.mode).toBe("local");
    expect(result.whatCouldHaveDone.length).toBeGreaterThan(0);
    expect(result.whatToChange.length).toBeGreaterThan(0);
    expect(result.sources.some((s) => s.sourceType === "spiritual")).toBe(true);
    expect(result.sources.some((s) => s.sourceType === "clinical")).toBe(true);
    expect(result.sources.every((s) => s.url.startsWith("http"))).toBe(true);
  });

  it("builds activity coaching from written answers", () => {
    const result = buildLocalActivityCoach({
      kind: "activity",
      date: "2026-03-22",
      title: "Prova",
      category: "proteggere_occhi_pensieri",
      objective: "Proteggere lo sguardo",
      writingPrompt: "Scrivi",
      reflectionQuestion: "Rifletti",
      dailyAction: "Posa il telefono",
      scriptureReferences: ["Romani 12:2"],
      personalResponse: "Di sera a letto col telefono cedo più facilmente",
      reflectionAnswer: "Devo cambiare l'ambiente",
      completed: true,
    });
    expect(result.summary).toContain("Prova");
    expect(result.whatToChange.some((x) => x.toLowerCase().includes("telefono") || x.toLowerCase().includes("ambiente"))).toBe(
      true,
    );
    expect(result.nextSteps.length).toBeGreaterThan(0);
  });
});
