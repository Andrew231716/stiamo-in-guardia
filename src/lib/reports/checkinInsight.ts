import {
  CHAIN_STAGE_LABELS,
  STRATEGY_CATALOG,
  TRIGGER_CATALOG,
} from "@/data/catalog";
import type { ChainStage, DailyCheckin, StrategyItem } from "@/lib/types";

export type DaySeverity = "none" | "low" | "moderate" | "elevated";

export interface CheckinInsight {
  tone: "victory" | "interrupted" | "learning" | "neutral";
  headline: string;
  whereToAct: string;
  earlierBreakPoints: string[];
  suggestedActions: string[];
  daySeverity: DaySeverity;
  daySeverityLabel: string;
  daySeverityNote: string;
  encouragement: string;
}

const STAGE_ORDER: ChainStage[] = ["trigger", "impulse", "phone", "search", "action"];

const STAGE_ACTIONS: Partial<Record<ChainStage, string[]>> = {
  trigger: [
    "Nomina ad alta voce il trigger («Sono annoiato / solo / stanco»): riconoscerlo spezza l'automatismo.",
    "Cambia subito stanza o attività prima che l'impulso cresca.",
    "Rivolgiti a Geova con una frase breve e sincera.",
  ],
  impulse: [
    "Posa il telefono fuori portata entro 10 secondi.",
    "Alzati, bevi acqua o fai due passi: il corpo interrompe la sequenza mentale.",
    "Osserva l'impulso senza obbedirgli: è una sensazione, non un comando.",
  ],
  phone: [
    "Lascia il telefono in un'altra stanza o mettilo in modalità non disturbare / grayscale.",
    "Apri piuttosto JW Library o un compito pratico già deciso.",
    "Se sei a letto, alzati e metti il telefono in carica lontano.",
  ],
  search: [
    "Chiudi l'app o il browser senza «solo un'occhiata».",
    "Cancella la barra di ricerca e apri qualcosa di edificante.",
    "Esci da Internet per 15 minuti e fai un'azione concreta (ordine, passeggiata, chiamata).",
  ],
  action: [
    "La prossima volta punta a interrompere al momento del telefono o dell'impulso: più è precoce, più è facile.",
    "Prepara stanotte l'ambiente (telefono fuori dalla stanza) prima che arrivi la fatica.",
    "Annota un piano se-allora per lo stesso trigger.",
  ],
};

const TRIGGER_ACTIONS: Record<string, string> = {
  boredom: "Tieni pronto un elenco di 3 attività utili o edificanti per i momenti di noia.",
  loneliness: "Programma un contatto con un amico o un servizio spirituale prima che la solitudine cresca.",
  stress: "Scegli uno sfogo sano breve (camminata, ordine, preghiera) appena noti lo stress.",
  anxiety: "Rallenta il corpo (respiri lunghi) e posa il telefono prima di cercare sollievo online.",
  sadness: "Chiedi sostegno a Geova e a una persona di fiducia; non restare da solo con lo sconforto.",
  frustration: "Riempi la mente di qualcosa di buono invece di fissare il desiderio o l'irritazione.",
  marriage_wait: "Coltiva pazienza e un'azione edificante concreta, senza decisioni dettate dalla frustrazione.",
  discouragement: "Interrompi lo scoraggiamento con un passo piccolo e buono; non lasciare la mente vuota.",
  fatigue: "Quando sei stanco, riduci le decisioni: piano se-allora già pronto + telefono lontano.",
  drowsiness: "Non restare a letto con il telefono se sei assonnato; carica il dispositivo altrove.",
  restlessness: "Muovi il corpo o inizia un compito pratico breve prima di aprire lo schermo.",
  phone_nearby: "Tieni il telefono fuori portata nei momenti vulnerabili.",
  aimless_browsing: "Apri solo app con uno scopo chiaro; evita lo scorrimento senza meta.",
  provocative_content: "Distogli lo sguardo e chiudi subito; non soffermarti «per curiosità».",
  bed_with_phone: "Metti in carica il telefono fuori dalla camera prima di coricarti.",
  low_lucidity_hours: "Nei tuoi orari poco lucidi, prepara ambiente e telefono in anticipo.",
  habit_environment: "Cambia luogo o routine nei contesti associati alle vecchie abitudini.",
};

function strategySuggestions(
  triggers: string[],
  chainStage: ChainStage,
  alreadyUsed: string[],
  custom: StrategyItem[],
): string[] {
  const catalog = [...STRATEGY_CATALOG, ...custom];
  const used = new Set(alreadyUsed);
  const preferredIds: string[] = [];

  if (triggers.includes("bed_with_phone") || triggers.includes("phone_nearby") || chainStage === "phone") {
    preferredIds.push("put_phone_away", "leave_phone_elsewhere", "sleep_prep");
  }
  if (triggers.includes("provocative_content") || chainStage === "search") {
    preferredIds.push("look_away", "change_room");
  }
  if (
    triggers.includes("boredom") ||
    triggers.includes("restlessness") ||
    triggers.includes("loneliness")
  ) {
    preferredIds.push("start_task", "short_walk", "tidy_space");
  }
  if (
    triggers.includes("frustration") ||
    triggers.includes("discouragement") ||
    triggers.includes("marriage_wait")
  ) {
    preferredIds.push("pray", "read_scripture", "if_then");
  }
  if (chainStage === "impulse" || chainStage === "trigger") {
    preferredIds.push("pray", "urge_surf", "drink_water", "change_room");
  }
  preferredIds.push("if_then", "pray", "put_phone_away");

  const out: string[] = [];
  for (const id of preferredIds) {
    if (used.has(id)) continue;
    const s = catalog.find((x) => x.id === id);
    if (!s) continue;
    out.push(`${s.name}: ${s.description}`);
    if (out.length >= 4) break;
  }
  return out;
}

function computeDaySeverity(c: Pick<
  DailyCheckin,
  | "pornographyStatus"
  | "masturbationStatus"
  | "chainStage"
  | "strategiesUsed"
  | "prayerCompleted"
  | "involuntaryImpulseStatus"
>): { level: DaySeverity; label: string; note: string } {
  const porn = c.pornographyStatus === "episode";
  const mast = c.masturbationStatus === "episode";
  const both = porn && mast;
  const late =
    c.chainStage === "search" || c.chainStage === "action";
  const earlyStop =
    c.chainStage === "interrupted_early" ||
    c.chainStage === "trigger" ||
    c.chainStage === "impulse";
  const protectedDay = c.strategiesUsed.length > 0 || c.prayerCompleted === true;

  if (!porn && !mast) {
    if (c.involuntaryImpulseStatus === "yes" && protectedDay) {
      return {
        level: "none",
        label: "Nessun episodio · guardia attiva",
        note: "Hai avuto impulsi e hai comunque scelto di proteggerti. Questo rafforza l'abitudine buona.",
      };
    }
    return {
      level: "none",
      label: "Nessun episodio registrato",
      note: "Gli impulsi involontari, se presenti, non sono una ricaduta. Continua a coltivare protezioni concrete.",
    };
  }

  if (earlyStop && protectedDay && !both) {
    return {
      level: "low",
      label: "Episodio con interruzione precoce",
      note: "C'è stato un cedimento, ma hai interrotto relativamente presto e hai usato strategie. Il rischio di automatismo diminuisce se ripeti questa interruzione.",
    };
  }

  if (both || (late && !protectedDay)) {
    return {
      level: "elevated",
      label: "Episodio più avanzato nella sequenza",
      note: "Non è una condanna: è un segnale che la sequenza è andata avanti. La prossima protezione va messa prima, all'impulso o al telefono.",
    };
  }

  return {
    level: "moderate",
    label: "Episodio da imparare",
    note: "Un episodio non cancella i progressi. Serve un aggiustamento concreto sul trigger e sul punto della sequenza in cui sei arrivato.",
  };
}

export function buildCheckinInsight(
  checkin: Pick<
    DailyCheckin,
    | "pornographyStatus"
    | "masturbationStatus"
    | "involuntaryImpulseStatus"
    | "triggers"
    | "chainStage"
    | "strategiesUsed"
    | "smallVictory"
    | "prayerCompleted"
    | "interruptionPoint"
  >,
  customStrategies: StrategyItem[] = [],
): CheckinInsight {
  const hasEpisode =
    checkin.pornographyStatus === "episode" || checkin.masturbationStatus === "episode";
  const severity = computeDaySeverity(checkin);
  const stageLabel = CHAIN_STAGE_LABELS[checkin.chainStage] ?? checkin.chainStage;

  const earlierBreakPoints: string[] = [];
  const stageIdx = STAGE_ORDER.indexOf(checkin.chainStage);
  if (stageIdx > 0) {
    for (let i = 0; i < stageIdx; i++) {
      earlierBreakPoints.push(CHAIN_STAGE_LABELS[STAGE_ORDER[i]] ?? STAGE_ORDER[i]);
    }
  } else if (checkin.chainStage === "interrupted_early") {
    earlierBreakPoints.push("Hai interrotto all'inizio della sequenza — punto forte da ripetere.");
  }

  let whereToAct: string;
  if (!hasEpisode && checkin.chainStage === "interrupted_early") {
    whereToAct =
      "Hai interrotto presto. Il punto di forza da ripetere è proprio l'inizio della sequenza (trigger → impulso).";
  } else if (!hasEpisode) {
    whereToAct =
      checkin.strategiesUsed.length || checkin.prayerCompleted
        ? "Hai protetto la giornata. Continua a intervenire allo stesso punto della sequenza in cui di solito noti il rischio."
        : "Anche senza episodi, prepara in anticipo il punto più debole (spesso telefono a portata o orari poco lucidi).";
  } else if (checkin.interruptionPoint?.trim()) {
    whereToAct = `Hai indicato: «${checkin.interruptionPoint.trim()}». È il punto su cui costruire il piano se-allora.`;
  } else if (stageIdx >= 0) {
    whereToAct = `Nella sequenza sei arrivato a «${stageLabel}». Il punto più utile per agire la prossima volta è uno dei passi precedenti, idealmente all'impulso o al telefono.`;
  } else {
    whereToAct =
      "Individua il primo momento in cui hai notato il rischio (trigger o impulso) e prepara lì una risposta pronta.";
  }

  const suggestedActions: string[] = [];
  if (checkin.chainStage in STAGE_ACTIONS) {
    suggestedActions.push(...(STAGE_ACTIONS[checkin.chainStage] ?? []));
  }
  for (const t of checkin.triggers) {
    if (TRIGGER_ACTIONS[t]) suggestedActions.push(TRIGGER_ACTIONS[t]);
  }
  suggestedActions.push(
    ...strategySuggestions(
      checkin.triggers,
      checkin.chainStage,
      checkin.strategiesUsed,
      customStrategies,
    ),
  );

  // Deduplicate while preserving order
  const uniqueActions = [...new Set(suggestedActions)].slice(0, 6);

  let tone: CheckinInsight["tone"] = "neutral";
  let headline = "Lettura del check-in";
  let encouragement =
    "La sincerità nel registrare è già un passo. Geova apprezza un cuore che vuole restare puro.";

  if (!hasEpisode && (checkin.smallVictory?.trim() || checkin.chainStage === "interrupted_early")) {
    tone = "victory";
    headline = "Piccola vittoria da consolidare";
    encouragement =
      "Quello che ha funzionato oggi merita di diventare routine. Ripetilo nei prossimi giorni vulnerabili.";
  } else if (!hasEpisode) {
    tone = "interrupted";
    headline = "Giorno senza episodi registrati";
    encouragement =
      "Continua a coltivare protezioni concrete: non è solo «tenere duro», è costruire un'abitudine buona.";
  } else if (severity.level === "low") {
    tone = "learning";
    headline = "Dove avresti potuto agire — e cosa fare ora";
    encouragement =
      "Hai interrotto relativamente presto. La prossima volta punta ancora un passo prima.";
  } else {
    tone = "learning";
    headline = "Dove avresti potuto agire — e cosa fare ora";
    encouragement =
      "Una ricaduta non cancella i progressi. Serve una protezione più precoce, non più vergogna.";
  }

  const triggerNames = checkin.triggers
    .map((id) => TRIGGER_CATALOG.find((t) => t.id === id)?.name ?? id)
    .filter(Boolean);
  if (triggerNames.length && hasEpisode) {
    whereToAct += ` Trigger segnalati: ${triggerNames.join(", ")}.`;
  }

  return {
    tone,
    headline,
    whereToAct,
    earlierBreakPoints,
    suggestedActions: uniqueActions,
    daySeverity: severity.level,
    daySeverityLabel: severity.label,
    daySeverityNote: severity.note,
    encouragement,
  };
}
