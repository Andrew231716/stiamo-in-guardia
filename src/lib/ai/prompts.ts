import { z } from "zod";
import { sourcesCatalogForPrompt, coachDisclaimer, pickCoachSources } from "@/lib/ai/sourcesForCoach";
import type { AiCoachInput, AiCoachResult, AiCoachMode } from "@/lib/ai/types";

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|•|- /)
      .map((s) => s.replace(/^[\d).]+\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

const looseResultSchema = z.object({
  summary: z.union([z.string(), z.number()]).transform((v) => String(v).trim()),
  whatCouldHaveDone: z.unknown().optional(),
  whatToChange: z.unknown().optional(),
  nextSteps: z.unknown().optional(),
  // alias comuni usati dai modelli
  cosaAvrestiPotutoFare: z.unknown().optional(),
  cosaCambiare: z.unknown().optional(),
  prossimiPassi: z.unknown().optional(),
  sourceIdsOrTitles: z.unknown().optional(),
});

export function extractJsonObject(raw: string): unknown | null {
  if (!raw?.trim()) return null;
  let text = raw.trim();

  // Rimuovi fence markdown
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // Alcuni modelli (gpt-oss) avvolgono ragionamento / canali
  text = text
    .replace(/<\|[^>]+\|>/g, " ")
    .replace(/<\/?think>/gi, " ")
    .replace(/<\/?reasoning>/gi, " ")
    .trim();

  // Prova parse diretto
  try {
    return JSON.parse(text) as unknown;
  } catch {
    /* continua */
  }

  // Estrai il primo oggetto { ... } bilanciato
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        const slice = text.slice(start, i + 1);
        try {
          return JSON.parse(slice) as unknown;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export function buildAnalyzeSystemPrompt(): string {
  return [
    "Sei un coach spirituale e di consapevolezza per un'app personale dei Testimoni di Geova («Stiamo in guardia»).",
    "Rispondi SOLO in italiano, con tono incoraggiante, mai giudicante o umiliante.",
    "Gli impulsi involontari NON sono ricadute.",
    "NON inventare citazioni bibliche testuali né URL. Usa SOLO le fonti elencate sotto (JW.org/WOL e siti ufficiali di psicologia/salute).",
    "Distingui chiaramente: prospettive spirituali (JW.org) vs contesto clinico generale (NIMH, NHS, WHO, APA, SAMHSA, VA).",
    "Non dare diagnosi di dipendenza. Non chiedere dettagli espliciti.",
    "Suggerisci azioni concrete: dove interrompere la sequenza, cosa cambiare nell'ambiente, cosa coltivare.",
    "IMPORTANTE: la tua intera risposta deve essere UN SOLO oggetto JSON valido, senza markdown, senza testo prima o dopo.",
    'Schema esatto: {"summary":"stringa","whatCouldHaveDone":["..."],"whatToChange":["..."],"nextSteps":["..."],"sourceIdsOrTitles":["..."]}',
    "Ogni array deve avere da 2 a 5 stringhe brevi in italiano.",
    "",
    "FONTI CONSENTITE:",
    sourcesCatalogForPrompt(),
  ].join("\n");
}

export function buildAnalyzeUserPrompt(input: AiCoachInput): string {
  if (input.kind === "checkin") {
    return [
      "Analizza questo check-in e indica cosa avrei potuto fare e cosa cambiare.",
      "Rispondi SOLO con JSON valido secondo lo schema indicato.",
      JSON.stringify(input, null, 2),
    ].join("\n");
  }
  return [
    "Analizza le risposte a questa attività spirituale e indica cosa avrei potuto fare meglio e cosa cambiare.",
    "Rispondi SOLO con JSON valido secondo lo schema indicato.",
    JSON.stringify(input, null, 2),
  ].join("\n");
}

export function buildJsonRetryPrompt(): string {
  return [
    "La risposta precedente non era JSON valido.",
    "Rispondi ADESSO con UN SOLO oggetto JSON, nient'altro.",
    'Esempio: {"summary":"...","whatCouldHaveDone":["..."],"whatToChange":["..."],"nextSteps":["..."],"sourceIdsOrTitles":["..."]}',
  ].join(" ");
}

export function parseCloudCoachResult(
  raw: string,
  mode: Exclude<AiCoachMode, "local">,
  label: string,
  kind: AiCoachInput["kind"],
): AiCoachResult | null {
  try {
    const json = extractJsonObject(raw);
    if (!json || typeof json !== "object") return null;
    const parsed = looseResultSchema.safeParse(json);
    if (!parsed.success) return null;

    const summary = parsed.data.summary;
    if (!summary) return null;

    const whatCouldHaveDone = asStringArray(
      parsed.data.whatCouldHaveDone ?? parsed.data.cosaAvrestiPotutoFare,
    ).slice(0, 6);
    const whatToChange = asStringArray(parsed.data.whatToChange ?? parsed.data.cosaCambiare).slice(0, 6);
    const nextSteps = asStringArray(parsed.data.nextSteps ?? parsed.data.prossimiPassi).slice(0, 6);

    if (!whatCouldHaveDone.length && !whatToChange.length && !nextSteps.length) return null;

    const topics =
      kind === "checkin"
        ? (["tentazione", "padronanza", "pornografia", "rinnovare_mente"] as const)
        : (["tentazione", "rinnovare_mente", "amare_bene", "padronanza"] as const);

    const sources = pickCoachSources([...topics]);

    return {
      mode,
      providerLabel: label,
      summary,
      whatCouldHaveDone: whatCouldHaveDone.length
        ? whatCouldHaveDone
        : ["Prepara una protezione concreta per il momento di rischio più frequente."],
      whatToChange: whatToChange.length
        ? whatToChange
        : ["Rendi ripetibile una sola abitudine buona, invece di cambiare tutto insieme."],
      nextSteps: nextSteps.length
        ? nextSteps
        : ["Apri una fonte JW.org consigliata e applica un solo punto oggi."],
      sources,
      disclaimer: coachDisclaimer(),
    };
  } catch {
    return null;
  }
}
