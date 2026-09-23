import { TRIGGER_CATALOG, CHAIN_STAGE_LABELS } from "@/data/catalog";
import type { DailyCheckin, UserPreferences } from "@/lib/types";
import { datesInRange } from "@/lib/utils/date";
import { format, parseISO, startOfWeek, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";

export type RiskDirection = "improving" | "stable" | "worsening" | "insufficient";
export type SeverityBand = "low" | "moderate" | "elevated" | "insufficient";

export interface RelapseVictoryPoint {
  weekLabel: string;
  weekKey: string;
  ricadute: number;
  vittorie: number;
}

export interface MonthlyHabitAssessment {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
  insufficientData: boolean;
  checkInDays: number;
  episodeDays: number;
  victoryDays: number;
  impulseOnlyDays: number;
  severityBand: SeverityBand;
  severityLabel: string;
  severitySummary: string;
  riskScore: number | null;
  previousRiskScore: number | null;
  riskDirection: RiskDirection;
  riskDirectionLabel: string;
  riskSummary: string;
  factorsUp: string[];
  factorsDown: string[];
  focusActions: string[];
  series: RelapseVictoryPoint[];
  disclaimer: string;
}

function hasEpisode(c: DailyCheckin, prefs: UserPreferences): boolean {
  const porn = prefs.relapseDefinition.countPornography && c.pornographyStatus === "episode";
  const mast = prefs.relapseDefinition.countMasturbation && c.masturbationStatus === "episode";
  return Boolean(porn || mast);
}

function isVictoryDay(c: DailyCheckin, prefs: UserPreferences): boolean {
  if (hasEpisode(c, prefs)) {
    return (
      c.chainStage === "interrupted_early" ||
      Boolean(c.smallVictory?.trim()) ||
      c.strategiesUsed.length > 0
    );
  }
  return (
    Boolean(c.smallVictory?.trim()) ||
    c.chainStage === "interrupted_early" ||
    c.strategiesUsed.length > 0 ||
    c.prayerCompleted === true ||
    c.pornographyStatus === "none" ||
    c.masturbationStatus === "none"
  );
}

/** Punteggio 0–100: più alto = maggiore rischio di automatismo / abitudine impura (strumento di consapevolezza, non diagnosi). */
export function computeRiskScore(checkins: DailyCheckin[], prefs: UserPreferences): number | null {
  if (checkins.length < 3) return null;

  let episodeWeight = 0;
  let lateChain = 0;
  let earlyInterrupt = 0;
  let strategies = 0;
  let prayer = 0;
  let victories = 0;
  let impulseYes = 0;

  for (const c of checkins) {
    const ep = hasEpisode(c, prefs);
    if (ep) {
      episodeWeight += c.pornographyStatus === "episode" && c.masturbationStatus === "episode" ? 1.4 : 1;
      if (c.chainStage === "search" || c.chainStage === "action") lateChain += 1;
      if (c.chainStage === "interrupted_early" || c.chainStage === "impulse" || c.chainStage === "phone") {
        earlyInterrupt += 0.5;
      }
    } else {
      if (c.involuntaryImpulseStatus === "yes") impulseYes += 1;
    }
    if (c.strategiesUsed.length) strategies += 1;
    if (c.prayerCompleted === true) prayer += 1;
    if (c.smallVictory?.trim() || c.chainStage === "interrupted_early") victories += 1;
  }

  const n = checkins.length;
  const episodeRate = episodeWeight / n;
  const lateRate = lateChain / n;
  const protectRate = (strategies + prayer + victories + earlyInterrupt) / (n * 2.5);
  const impulseRate = impulseYes / n;

  // Base risk from episodes and late chain; protection and victories pull down
  let score = 18 + episodeRate * 55 + lateRate * 20 + impulseRate * 8 - protectRate * 35;
  score = Math.round(Math.min(95, Math.max(5, score)));
  return score;
}

function bandFromScore(score: number | null, episodeDays: number, checkInDays: number): SeverityBand {
  if (score == null || checkInDays < 3) return "insufficient";
  const rate = checkInDays ? episodeDays / checkInDays : 0;
  if (score >= 65 || rate >= 0.5) return "elevated";
  if (score >= 40 || rate >= 0.25) return "moderate";
  return "low";
}

export function buildRelapseVictorySeries(
  checkins: DailyCheckin[],
  prefs: UserPreferences,
  startDate: string,
  endDate: string,
): RelapseVictoryPoint[] {
  const inRange = checkins.filter((c) => c.date >= startDate && c.date <= endDate);
  const weeks = new Map<string, RelapseVictoryPoint>();

  for (const c of inRange) {
    const weekStart = startOfWeek(parseISO(c.date), { weekStartsOn: 1 });
    const key = format(weekStart, "yyyy-MM-dd");
    const label = format(weekStart, "'Sett.' d MMM", { locale: it });
    const current = weeks.get(key) ?? { weekKey: key, weekLabel: label, ricadute: 0, vittorie: 0 };
    if (hasEpisode(c, prefs)) current.ricadute += 1;
    if (isVictoryDay(c, prefs)) current.vittorie += 1;
    weeks.set(key, current);
  }

  return [...weeks.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => v);
}

export function buildMonthlyHabitAssessment(params: {
  checkins: DailyCheckin[];
  preferences: UserPreferences;
  startDate: string;
  endDate: string;
}): MonthlyHabitAssessment {
  const { checkins, preferences, startDate, endDate } = params;
  const start = parseISO(startDate);
  const prev = subMonths(start, 1);
  const previousStartDate = format(startOfMonth(prev), "yyyy-MM-dd");
  const previousEndDate = format(endOfMonth(prev), "yyyy-MM-dd");

  const current = checkins.filter((c) => c.date >= startDate && c.date <= endDate);
  const previous = checkins.filter((c) => c.date >= previousStartDate && c.date <= previousEndDate);

  const checkInDays = current.length;
  const insufficientData = checkInDays < 3;
  const episodeDays = current.filter((c) => hasEpisode(c, preferences)).length;
  const victoryDays = current.filter((c) => isVictoryDay(c, preferences)).length;
  const impulseOnlyDays = current.filter(
    (c) => !hasEpisode(c, preferences) && c.involuntaryImpulseStatus === "yes",
  ).length;

  const riskScore = computeRiskScore(current, preferences);
  const previousRiskScore = computeRiskScore(previous, preferences);

  let riskDirection: RiskDirection = "insufficient";
  if (riskScore != null && previousRiskScore != null) {
    const delta = riskScore - previousRiskScore;
    if (delta <= -8) riskDirection = "improving";
    else if (delta >= 8) riskDirection = "worsening";
    else riskDirection = "stable";
  } else if (riskScore != null && previous.length < 3) {
    riskDirection = "stable";
  }

  const severityBand = bandFromScore(riskScore, episodeDays, checkInDays);

  const severityLabel =
    severityBand === "insufficient"
      ? "Dati ancora insufficienti"
      : severityBand === "low"
        ? "Gravità complessiva: contenuta"
        : severityBand === "moderate"
          ? "Gravità complessiva: media"
          : "Gravità complessiva: da tenere d'occhio";

  const severitySummary = insufficientData
    ? "Servono almeno 3 check-in nel mese per una scheda affidabile. Continua a registrare con sincerità."
    : severityBand === "low"
      ? "Nel mese gli episodi sono relativamente pochi rispetto ai check-in, o sono stati spesso interrotti / accompagnati da strategie. L'errore, quando c'è, resta un segnale da correggere — non un'identità."
      : severityBand === "moderate"
        ? "Ci sono episodi ricorrenti o un coinvolgimento più frequente nella sequenza. Non è una condanna: indica che serve rafforzare protezioni precoci (ambiente, telefono, preghiera)."
        : "Gli episodi sono più frequenti, oppure arrivi più avanti nella sequenza. È un invito a intervenire prima e con più costanza, magari anche chiedendo sostegno a un responsabile spirituale di fiducia — senza vergogna.";

  const riskDirectionLabel =
    riskDirection === "improving"
      ? "Ti stai allontanando dal rischio di automatismo"
      : riskDirection === "worsening"
        ? "Ti stai avvicinando a un'abitudine più radicata"
        : riskDirection === "stable"
          ? "Il rischio appare stabile rispetto al mese scorso"
          : "Confronto mensile non ancora disponibile";

  const riskSummary =
    riskScore == null
      ? "Il punteggio di rischio comparirà con più check-in. Non è una diagnosi di dipendenza: è un indicatore personale di consapevolezza."
      : riskDirection === "improving"
        ? `Indicatore di rischio ${riskScore}/100 (mese scorso ${previousRiskScore}/100). Le protezioni e le vittorie stanno pesando di più degli episodi.`
        : riskDirection === "worsening"
          ? `Indicatore di rischio ${riskScore}/100 (mese scorso ${previousRiskScore}/100). Attenzione: la sequenza o la frequenza degli episodi stanno crescendo — interveni prima (telefono, orari, piani se-allora).`
          : `Indicatore di rischio ${riskScore}/100. Mantieni ciò che funziona e rafforza un solo punto debole alla volta.`;

  const factorsUp: string[] = [];
  const factorsDown: string[] = [];
  const focusActions: string[] = [];

  if (!insufficientData) {
    const triggerCounts = new Map<string, number>();
    let late = 0;
    let withStrategy = 0;
    let withPrayer = 0;
    for (const c of current) {
      for (const t of c.triggers) triggerCounts.set(t, (triggerCounts.get(t) ?? 0) + 1);
      if (c.chainStage === "search" || c.chainStage === "action") late += 1;
      if (c.strategiesUsed.length) withStrategy += 1;
      if (c.prayerCompleted === true) withPrayer += 1;
    }
    const topTriggers = [...triggerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

    if (episodeDays / checkInDays >= 0.3) {
      factorsUp.push(`Episodi in ${episodeDays} di ${checkInDays} check-in.`);
    }
    if (late >= 2) {
      factorsUp.push(
        `Sequenza arrivata spesso a «${CHAIN_STAGE_LABELS.search}» / «${CHAIN_STAGE_LABELS.action}» (${late} volte).`,
      );
    }
    if (topTriggers[0]) {
      const name = TRIGGER_CATALOG.find((t) => t.id === topTriggers[0][0])?.name ?? topTriggers[0][0];
      factorsUp.push(`Trigger ricorrente: ${name}.`);
      focusActions.push(`Prepara un piano se-allora specifico per «${name}» e usalo almeno due volte.`);
    }

    if (victoryDays >= Math.ceil(checkInDays * 0.4)) {
      factorsDown.push(`Giorni con vittorie / protezioni: ${victoryDays}.`);
    }
    if (withStrategy >= Math.ceil(checkInDays * 0.4)) {
      factorsDown.push(`Strategie usate in ${withStrategy} check-in.`);
    }
    if (withPrayer >= 2) {
      factorsDown.push(`Preghiera registrata in ${withPrayer} check-in.`);
    }
    if (impulseOnlyDays > 0) {
      factorsDown.push(
        `Impulsi senza episodio in ${impulseOnlyDays} giorni (non contano come ricadute).`,
      );
    }

    focusActions.push(
      "Interrompi prima nella sequenza: obiettivo «impulso → telefono fuori portata» entro pochi secondi.",
    );
    focusActions.push("Nei tuoi orari vulnerabili, prepara ambiente e telefono la sera prima.");
    if (withPrayer < 2) {
      focusActions.push("Collega il momento di rischio a una preghiera breve e sincera.");
    }
  }

  return {
    startDate,
    endDate,
    previousStartDate,
    previousEndDate,
    insufficientData,
    checkInDays,
    episodeDays,
    victoryDays,
    impulseOnlyDays,
    severityBand,
    severityLabel,
    severitySummary,
    riskScore,
    previousRiskScore,
    riskDirection,
    riskDirectionLabel,
    riskSummary,
    factorsUp: factorsUp.slice(0, 5),
    factorsDown: factorsDown.slice(0, 5),
    focusActions: [...new Set(focusActions)].slice(0, 4),
    series: buildRelapseVictorySeries(checkins, preferences, startDate, endDate),
    disclaimer:
      "Scheda personale di consapevolezza spirituale e comportamentale. Non è una diagnosi clinica di dipendenza e non sostituisce medici, psicologi o un responsabile spirituale.",
  };
}

/** Esporta helper per test sul conteggio giorni nel mese. */
export function monthDayCount(startDate: string, endDate: string): number {
  return datesInRange(startDate, endDate).length;
}
