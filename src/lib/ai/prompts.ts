import { z } from "zod";
import { sourcesCatalogForPrompt, coachDisclaimer, pickCoachSources } from "@/lib/ai/sourcesForCoach";
import type { AiCoachInput, AiCoachResult, AiCoachMode } from "@/lib/ai/types";

const resultSchema = z.object({
  summary: z.string().min(1),
  whatCouldHaveDone: z.array(z.string()).min(1).max(8),
  whatToChange: z.array(z.string()).min(1).max(8),
  nextSteps: z.array(z.string()).min(1).max(8),
  sourceIdsOrTitles: z.array(z.string()).max(8).optional(),
});

export function buildAnalyzeSystemPrompt(): string {
  return [
    "Sei un coach spirituale e di consapevolezza per un'app personale dei Testimoni di Geova («Stiamo in guardia»).",
    "Rispondi SOLO in italiano, con tono incoraggiante, mai giudicante o umiliante.",
    "Gli impulsi involontari NON sono ricadute.",
    "NON inventare citazioni bibliche testuali né URL. Usa SOLO le fonti elencate sotto (JW.org/WOL e siti ufficiali di psicologia/salute).",
    "Distingui chiaramente: prospettive spirituali (JW.org) vs contesto clinico generale (NIMH, NHS, WHO, APA, SAMHSA, VA).",
    "Non dare diagnosi di dipendenza. Non chiedere dettagli espliciti.",
    "Suggerisci azioni concrete: dove interrompere la sequenza, cosa cambiare nell'ambiente, cosa coltivare.",
    "Output JSON obbligatorio con campi: summary (string), whatCouldHaveDone (string[]), whatToChange (string[]), nextSteps (string[]), sourceIdsOrTitles (string[] titoli delle fonti usate).",
    "",
    "FONTI CONSENTITE:",
    sourcesCatalogForPrompt(),
  ].join("\n");
}

export function buildAnalyzeUserPrompt(input: AiCoachInput): string {
  if (input.kind === "checkin") {
    return [
      "Analizza questo check-in e indica cosa avrei potuto fare e cosa cambiare.",
      JSON.stringify(input, null, 2),
    ].join("\n");
  }
  return [
    "Analizza le risposte a questa attività spirituale e indica cosa avrei potuto fare meglio e cosa cambiare.",
    JSON.stringify(input, null, 2),
  ].join("\n");
}

export function parseCloudCoachResult(
  raw: string,
  mode: Exclude<AiCoachMode, "local">,
  label: string,
  kind: AiCoachInput["kind"],
): AiCoachResult | null {
  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const json = JSON.parse(cleaned) as unknown;
    const parsed = resultSchema.safeParse(json);
    if (!parsed.success) return null;

    const topics =
      kind === "checkin"
        ? (["tentazione", "padronanza", "pornografia", "rinnovare_mente"] as const)
        : (["tentazione", "rinnovare_mente", "amare_bene", "padronanza"] as const);

    // Ancora le fonti al catalogo ufficiale (niente URL inventati dal modello)
    const sources = pickCoachSources([...topics]);

    return {
      mode,
      providerLabel: label,
      summary: parsed.data.summary.trim(),
      whatCouldHaveDone: parsed.data.whatCouldHaveDone.map((s) => s.trim()).filter(Boolean).slice(0, 6),
      whatToChange: parsed.data.whatToChange.map((s) => s.trim()).filter(Boolean).slice(0, 6),
      nextSteps: parsed.data.nextSteps.map((s) => s.trim()).filter(Boolean).slice(0, 6),
      sources,
      disclaimer: coachDisclaimer(),
    };
  } catch {
    return null;
  }
}
