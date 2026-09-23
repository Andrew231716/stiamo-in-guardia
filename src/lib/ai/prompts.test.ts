import { describe, expect, it } from "vitest";
import { extractJsonObject, parseCloudCoachResult } from "@/lib/ai/prompts";

describe("cloud JSON parsing", () => {
  it("extracts JSON from markdown fences", () => {
    const raw = '```json\n{"summary":"ok","whatCouldHaveDone":["a"],"whatToChange":["b"],"nextSteps":["c"]}\n```';
    const parsed = parseCloudCoachResult(raw, "groq", "Groq · test", "activity");
    expect(parsed?.summary).toBe("ok");
    expect(parsed?.whatCouldHaveDone).toEqual(["a"]);
  });

  it("extracts JSON buried in prose", () => {
    const raw = `Ecco l'analisi:\n{"summary":"Bene","whatCouldHaveDone":["Uno"],"whatToChange":["Due"],"nextSteps":["Tre"]}\nFine.`;
    expect(extractJsonObject(raw)).toMatchObject({ summary: "Bene" });
    const parsed = parseCloudCoachResult(raw, "groq", "Groq · test", "checkin");
    expect(parsed?.mode).toBe("groq");
    expect(parsed?.whatToChange[0]).toBe("Due");
  });

  it("accepts Italian alias keys", () => {
    const raw = JSON.stringify({
      summary: "Riassunto",
      cosaAvrestiPotutoFare: ["X"],
      cosaCambiare: ["Y"],
      prossimiPassi: "1. Alfa\n2. Beta",
    });
    const parsed = parseCloudCoachResult(raw, "groq", "Groq · test", "activity");
    expect(parsed?.whatCouldHaveDone).toEqual(["X"]);
    expect(parsed?.whatToChange).toEqual(["Y"]);
    expect(parsed?.nextSteps.length).toBeGreaterThan(0);
  });
});
