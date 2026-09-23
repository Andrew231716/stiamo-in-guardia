import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildLocalActivityCoach,
  buildLocalCheckinCoach,
} from "@/lib/ai/localCoach";
import {
  buildAnalyzeSystemPrompt,
  buildAnalyzeUserPrompt,
  parseCloudCoachResult,
} from "@/lib/ai/prompts";
import { chatWithAvailableProvider, hasCloudAiProvider, listAvailableAiProviders } from "@/lib/ai/providers";
import type { ActivityCoachInput, CheckinCoachInput } from "@/lib/ai/types";

const checkinSchema = z.object({
  kind: z.literal("checkin"),
  date: z.string(),
  pornographyStatus: z.string(),
  masturbationStatus: z.string(),
  involuntaryImpulseStatus: z.string(),
  triggers: z.array(z.string()).max(30),
  chainStage: z.string(),
  strategiesUsed: z.array(z.string()).max(30),
  smallVictory: z.string().max(500).optional(),
  improvementNote: z.string().max(500).optional(),
  prayerCompleted: z.union([z.boolean(), z.null()]),
  interruptionPoint: z.string().max(500).optional(),
  preventiveAdjustment: z.string().max(500).optional(),
  notesSnippet: z.string().max(400).optional(),
});

const activitySchema = z.object({
  kind: z.literal("activity"),
  date: z.string(),
  title: z.string().max(200),
  category: z.string().max(80),
  objective: z.string().max(500),
  writingPrompt: z.string().max(500),
  reflectionQuestion: z.string().max(500),
  dailyAction: z.string().max(500),
  scriptureReferences: z.array(z.string()).max(12),
  personalResponse: z.string().max(2000).optional(),
  reflectionAnswer: z.string().max(2000).optional(),
  completed: z.boolean(),
});

const bodySchema = z.object({
  consent: z.literal(true),
  preferCloud: z.boolean().optional().default(true),
  input: z.union([checkinSchema, activitySchema]),
});

function localFor(input: CheckinCoachInput | ActivityCoachInput) {
  return input.kind === "checkin" ? buildLocalCheckinCoach(input) : buildLocalActivityCoach(input);
}

/**
 * Analisi coach su check-in o attività.
 * - Con GROQ_API_KEY / GEMINI_API_KEY / OPENAI_API_KEY: arricchisce via cloud (richiede consent).
 * - Altrimenti: analisi locale gratuita ancorata a JW.org + fonti cliniche ufficiali.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Richiesta non valida o consenso mancante." },
        { status: 400 },
      );
    }

    const input = parsed.data.input;
    const local = localFor(input);

    if (!parsed.data.preferCloud || !hasCloudAiProvider()) {
      return NextResponse.json({
        result: local,
        providers: listAvailableAiProviders(),
      });
    }

    try {
      const cloud = await chatWithAvailableProvider([
        { role: "system", content: buildAnalyzeSystemPrompt() },
        { role: "user", content: buildAnalyzeUserPrompt(input) },
      ]);

      if (!cloud) {
        return NextResponse.json({ result: local, providers: listAvailableAiProviders() });
      }

      const enriched = parseCloudCoachResult(cloud.content, cloud.mode, cloud.label, input.kind);
      if (!enriched) {
        return NextResponse.json({
          result: {
            ...local,
            summary: `${local.summary} (Il modello cloud non ha restituito JSON valido: uso analisi locale.)`,
          },
          providers: listAvailableAiProviders(),
          cloudError: "invalid_json",
        });
      }

      return NextResponse.json({
        result: enriched,
        providers: listAvailableAiProviders(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown";
      return NextResponse.json({
        result: {
          ...local,
          summary: `${local.summary} (Provider cloud non raggiungibile: analisi locale.)`,
        },
        providers: listAvailableAiProviders(),
        cloudError: message.slice(0, 180),
      });
    }
  } catch {
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    providers: listAvailableAiProviders(),
    cloudAvailable: hasCloudAiProvider(),
  });
}
