import { TRIGGER_CATALOG, STRATEGY_CATALOG, CHAIN_STAGE_LABELS } from "@/data/catalog";
import { ACTIVITY_CATEGORY_LABELS, type ActivityCategory } from "@/lib/types";
import { buildCheckinInsight } from "@/lib/reports/checkinInsight";
import { coachDisclaimer, pickCoachSources } from "@/lib/ai/sourcesForCoach";
import type {
  ActivityCoachInput,
  AiCoachResult,
  CheckinCoachInput,
} from "@/lib/ai/types";

function triggerNames(ids: string[]): string[] {
  return ids.map((id) => TRIGGER_CATALOG.find((t) => t.id === id)?.name ?? id);
}

function strategyNames(ids: string[]): string[] {
  return ids.map((id) => STRATEGY_CATALOG.find((s) => s.id === id)?.name ?? id);
}

export function buildLocalCheckinCoach(input: CheckinCoachInput): AiCoachResult {
  const insight = buildCheckinInsight({
    pornographyStatus: input.pornographyStatus as "none" | "episode" | "prefer_not_to_say",
    masturbationStatus: input.masturbationStatus as "none" | "episode" | "prefer_not_to_say",
    involuntaryImpulseStatus: input.involuntaryImpulseStatus as
      | "yes"
      | "no"
      | "dont_remember"
      | "prefer_not_to_say",
    triggers: input.triggers,
    chainStage: input.chainStage as Parameters<typeof buildCheckinInsight>[0]["chainStage"],
    strategiesUsed: input.strategiesUsed,
    smallVictory: input.smallVictory,
    prayerCompleted: input.prayerCompleted,
    interruptionPoint: input.interruptionPoint,
  });

  const whatToChange: string[] = [];
  if (input.improvementNote?.trim()) {
    whatToChange.push(`Hai scritto di voler migliorare: «${input.improvementNote.trim()}». Trasformalo in un piano se-allora concreto.`);
  }
  if (!input.strategiesUsed.length && (input.pornographyStatus === "episode" || input.masturbationStatus === "episode")) {
    whatToChange.push(
      "Nel check-in non risultano strategie usate: preparane almeno una la sera prima (telefono fuori portata, cambio stanza, preghiera breve).",
    );
  }
  if (input.prayerCompleted === false) {
    whatToChange.push(
      "Collega il momento di rischio a una preghiera sincera, anche di una frase: è un aiuto spirituale, non una tecnica magica.",
    );
  }
  if (input.triggers.includes("bed_with_phone") || input.triggers.includes("phone_nearby")) {
    whatToChange.push("Cambia l'ambiente: telefono in carica fuori dalla stanza prima di coricarti.");
  }
  if (input.triggers.includes("marriage_wait") || input.triggers.includes("frustration")) {
    whatToChange.push(
      "Riempi la giornata di altro di buono (servizio, amicizie, studio): l'attesa non deve lasciare la mente vuota.",
    );
  }
  if (!whatToChange.length) {
    whatToChange.push(
      "Mantieni ciò che ha funzionato e rendilo ripetibile: stessa protezione, stesso orario vulnerabile, stesso piano se-allora.",
    );
  }

  const nextSteps = [
    ...insight.suggestedActions.slice(0, 3),
    "Apri una delle fonti consigliate qui sotto e leggi solo un paragrafo applicabile a oggi.",
    "Se utile, registra una piccola vittoria anche quando interrompi all'inizio.",
  ];

  const topics: Array<"tentazione" | "padronanza" | "pornografia" | "matrimonio_pazienza" | "rinnovare_mente" | "clinical"> =
    ["tentazione", "padronanza"];
  if (input.pornographyStatus === "episode") topics.push("pornografia");
  if (input.triggers.includes("marriage_wait")) topics.push("matrimonio_pazienza");
  topics.push("rinnovare_mente");

  const triggers = triggerNames(input.triggers).join(", ") || "nessuno indicato";
  const strategies = strategyNames(input.strategiesUsed).join(", ") || "nessuna indicata";
  const stage = CHAIN_STAGE_LABELS[input.chainStage] ?? input.chainStage;

  return {
    mode: "local",
    providerLabel: "Analisi locale (gratuita, sul dispositivo)",
    summary: `${insight.headline}. ${insight.whereToAct} Sequenza: ${stage}. Trigger: ${triggers}. Strategie: ${strategies}. ${insight.daySeverityLabel}.`,
    whatCouldHaveDone: insight.suggestedActions.slice(0, 5),
    whatToChange: whatToChange.slice(0, 5),
    nextSteps: [...new Set(nextSteps)].slice(0, 5),
    sources: pickCoachSources(topics),
    disclaimer: coachDisclaimer(),
  };
}

export function buildLocalActivityCoach(input: ActivityCoachInput): AiCoachResult {
  const response = input.personalResponse?.trim() ?? "";
  const reflection = input.reflectionAnswer?.trim() ?? "";
  const categoryLabel =
    ACTIVITY_CATEGORY_LABELS[input.category as ActivityCategory] ?? input.category;

  const whatCouldHaveDone: string[] = [];
  const whatToChange: string[] = [];
  const nextSteps: string[] = [];

  if (!response && !reflection) {
    whatCouldHaveDone.push(
      "Anche due frasi sincere sulla risposta personale aiutano a fissare l'apprendimento: riprendi il prompt dell'attività.",
    );
    whatToChange.push("Dedica 3 minuti a scrivere cosa hai notato, senza dettagli espliciti.");
  } else {
    whatCouldHaveDone.push(
      `Collega la tua risposta all'azione concreta del giorno: «${input.dailyAction}».`,
    );
    if (input.scriptureReferences[0]) {
      whatCouldHaveDone.push(
        `Rileggi ${input.scriptureReferences[0]} in JW Library e scegli una sola frase da applicare stasera.`,
      );
    }
    whatCouldHaveDone.push(
      "Trasforma un punto della riflessione in un piano se-allora (Se… allora…) da usare al prossimo trigger.",
    );
  }

  const lower = `${response} ${reflection}`.toLowerCase();
  if (/(telefon|letto|notte|sera)/.test(lower)) {
    whatToChange.push("Prepara l'ambiente la sera prima: telefono fuori portata nei momenti poco lucidi.");
  }
  if (/(solitud|noia|stress|frustr|scoragg)/.test(lower)) {
    whatToChange.push(
      "Quando riconosci quell'emozione, riempi subito la mente di qualcosa di buono (compito utile, preghiera, contatto sano).",
    );
  }
  if (/(vergogn|odiare me|falliment|inutil)/.test(lower)) {
    whatToChange.push(
      "Distingui condotta e persona: puoi odiare ciò che è male senza odiare te stesso (Romani 12:9).",
    );
  }
  if (!whatToChange.length) {
    whatToChange.push(
      "Rendi ripetibile un solo comportamento utile emerso oggi, invece di cambiare tutto insieme.",
    );
  }

  nextSteps.push(`Completa o ripeti l'azione: ${input.dailyAction}`);
  nextSteps.push("Apri una fonte JW.org consigliata e una risorsa clinica ufficiale per contesto generale.");
  if (!input.completed) {
    nextSteps.push("Salva l'attività come completata quando hai dedicato il momento con sincerità.");
  } else {
    nextSteps.push("Porta una piccola vittoria di oggi nel prossimo check-in.");
  }

  const topics: Array<"tentazione" | "rinnovare_mente" | "amare_bene" | "padronanza" | "purezza" | "clinical"> = [
    "tentazione",
    "rinnovare_mente",
    "padronanza",
  ];
  if (input.category.includes("spiritual")) topics.push("amare_bene");
  if (input.category.includes("desideri") || input.category.includes("occhi")) topics.push("purezza");

  return {
    mode: "local",
    providerLabel: "Analisi locale (gratuita, sul dispositivo)",
    summary: `Attività «${input.title}» (${categoryLabel}). Obiettivo: ${input.objective}. ${
      response || reflection
        ? "Ho letto le tue risposte e propongo aggiustamenti pratici, ancorati a fonti ufficiali."
        : "Con poche o nessuna risposta scritta, l'analisi resta generale: completa i campi per un feedback più preciso."
    }`,
    whatCouldHaveDone: whatCouldHaveDone.slice(0, 5),
    whatToChange: whatToChange.slice(0, 5),
    nextSteps: nextSteps.slice(0, 5),
    sources: pickCoachSources(topics),
    disclaimer: coachDisclaimer(),
  };
}
