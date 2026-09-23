import { NextResponse } from "next/server";
import { z } from "zod";
import { chatWithAvailableProvider, hasCloudAiProvider } from "@/lib/ai/providers";

const bodySchema = z.object({
  consent: z.literal(true),
  category: z.string(),
  recentTitles: z.array(z.string()).max(20).default([]),
  recurringTriggers: z.array(z.string()).max(20).default([]),
  usefulStrategies: z.array(z.string()).max(20).default([]),
  spiritualGoals: z.array(z.string()).max(10).default([]),
});

/**
 * Generazione AI opzionale di un'attività (Modalità B).
 * Usa Groq / Gemini / OpenAI se configurati; altrimenti fallback locale.
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

    if (!hasCloudAiProvider()) {
      return NextResponse.json({
        mode: "local_fallback",
        message:
          "Provider AI cloud non configurato. Usa la libreria locale di attività. Per abilitare: imposta GROQ_API_KEY (gratuito) o GEMINI_API_KEY / OPENAI_API_KEY su Vercel.",
      });
    }

    const prompt = [
      "Sei un assistente spirituale rispettoso per un'app personale dei Testimoni di Geova.",
      "Genera UNA attività quotidiana in italiano (5-15 minuti).",
      "Non inventare citazioni testuali o fonti. Distingui convinzioni religiose e scienza.",
      "Non usare linguaggio giudicante. Non contare impulsi involontari come ricadute.",
      `Categoria: ${parsed.data.category}`,
      `Titoli recenti da evitare: ${parsed.data.recentTitles.join(" | ") || "nessuno"}`,
      `Trigger ricorrenti: ${parsed.data.recurringTriggers.join(", ") || "non disponibili"}`,
      `Strategie utili: ${parsed.data.usefulStrategies.join(", ") || "non disponibili"}`,
      "Rispondi solo JSON con campi: title, durationMinutes, objective, introduction, scriptureReferences, instructions, writingPrompt, reflectionQuestion, dailyAction.",
    ].join("\n");

    try {
      const cloud = await chatWithAvailableProvider([
        { role: "system", content: "Generi solo JSON valido per attività spirituali equilibrate." },
        { role: "user", content: prompt },
      ]);
      if (!cloud) {
        return NextResponse.json({
          mode: "local_fallback",
          message: "Nessun provider AI disponibile.",
        });
      }
      return NextResponse.json({ mode: cloud.mode, content: cloud.content, provider: cloud.label });
    } catch {
      return NextResponse.json(
        { error: "Il provider AI ha restituito un errore.", mode: "local_fallback" },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Errore interno", mode: "local_fallback" }, { status: 500 });
  }
}
