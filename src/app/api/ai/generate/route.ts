import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  consent: z.literal(true),
  category: z.string(),
  recentTitles: z.array(z.string()).max(20).default([]),
  recurringTriggers: z.array(z.string()).max(20).default([]),
  usefulStrategies: z.array(z.string()).max(20).default([]),
  spiritualGoals: z.array(z.string()).max(10).default([]),
});

/**
 * Generazione AI opzionale (Modalità B).
 * Richiede OPENAI_API_KEY (solo server). Senza chiave, risponde con istruzioni.
 * Non accettare richieste senza consent=true.
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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        mode: "local_fallback",
        message:
          "Provider AI non configurato. Usa la libreria locale. Per abilitare: imposta OPENAI_API_KEY su Vercel e ridistribuisci.",
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: "Generi solo JSON valido per attività spirituali equilibrate." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Il provider AI ha restituito un errore.", mode: "local_fallback" },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content ?? "{}";
    return NextResponse.json({ mode: "ai", content });
  } catch {
    return NextResponse.json({ error: "Errore interno", mode: "local_fallback" }, { status: 500 });
  }
}
