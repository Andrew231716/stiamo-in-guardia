import { TRIGGER_CATALOG, STRATEGY_CATALOG, CHAIN_STAGE_LABELS } from "@/data/catalog";
import type { DailyActivityRecord, DailyCheckin, PrayerEntry, ReportData, UserPreferences } from "@/lib/types";
import { datesInRange } from "@/lib/utils/date";

function triggerName(id: string): string {
  return TRIGGER_CATALOG.find((t) => t.id === id)?.name ?? id;
}

function strategyName(id: string): string {
  return STRATEGY_CATALOG.find((s) => s.id === id)?.name ?? id;
}

function isEpisode(status: DailyCheckin["pornographyStatus"] | DailyCheckin["masturbationStatus"]): boolean {
  return status === "episode";
}

function hasRecordedEpisode(c: DailyCheckin, prefs: UserPreferences): boolean {
  const porn = prefs.relapseDefinition.countPornography && isEpisode(c.pornographyStatus);
  const mast = prefs.relapseDefinition.countMasturbation && isEpisode(c.masturbationStatus);
  return Boolean(porn || mast);
}

export function buildReport(params: {
  periodType: "weekly" | "monthly";
  startDate: string;
  endDate: string;
  checkins: DailyCheckin[];
  activities: DailyActivityRecord[];
  prayers: PrayerEntry[];
  preferences: UserPreferences;
}): ReportData {
  const { periodType, startDate, endDate, preferences } = params;
  const rangeDates = datesInRange(startDate, endDate);
  const checkins = params.checkins.filter((c) => c.date >= startDate && c.date <= endDate);
  const activities = params.activities.filter(
    (a) => a.date >= startDate && a.date <= endDate && Boolean(a.completedAt),
  );
  const prayers = params.prayers.filter((p) => p.date >= startDate && p.date <= endDate && p.completed);

  const checkInDays = checkins.length;
  const insufficientData = checkInDays < Math.min(3, rangeDates.length);

  const pornographyEpisodes = checkins.filter((c) => isEpisode(c.pornographyStatus)).length;
  const masturbationEpisodes = checkins.filter((c) => isEpisode(c.masturbationStatus)).length;

  // Never treat missing check-ins as clean days
  let daysWithoutEpisodes: number | null = null;
  if (!insufficientData) {
    daysWithoutEpisodes = checkins.filter((c) => !hasRecordedEpisode(c, preferences)).length;
  }

  const triggerCounts = new Map<string, number>();
  const strategyCounts = new Map<string, number>();
  const interruptionStrategyCounts = new Map<string, number>();
  const smallVictories: string[] = [];
  const difficulties: string[] = [];

  for (const c of checkins) {
    for (const t of c.triggers) triggerCounts.set(t, (triggerCounts.get(t) ?? 0) + 1);
    for (const s of c.strategiesUsed) strategyCounts.set(s, (strategyCounts.get(s) ?? 0) + 1);
    if (
      c.chainStage === "interrupted_early" ||
      c.chainStage === "trigger" ||
      c.chainStage === "impulse" ||
      c.chainStage === "phone"
    ) {
      for (const s of c.strategiesUsed) {
        interruptionStrategyCounts.set(s, (interruptionStrategyCounts.get(s) ?? 0) + 1);
      }
    }
    if (c.smallVictory?.trim()) smallVictories.push(c.smallVictory.trim());
    if (c.improvementNote?.trim()) difficulties.push(c.improvementNote.trim());
    if (hasRecordedEpisode(c, preferences) && c.notes?.trim()) difficulties.push(c.notes.trim());
  }

  const topTriggers = [...triggerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, count]) => ({ name: triggerName(id), count }));

  const strategiesUsed = [...strategyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, count]) => ({ name: strategyName(id), count }));

  const strategiesWithInterruptions = [...interruptionStrategyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ name: strategyName(id), count }));

  const vulnerabilityNotes: string[] = [];
  if (topTriggers.length) {
    vulnerabilityNotes.push(`Trigger più segnalati: ${topTriggers.map((t) => t.name).join(", ")}.`);
  }
  const stages = checkins.map((c) => c.chainStage).filter((s) => s !== "prefer_not_to_say" && s !== "not_applicable");
  if (stages.length) {
    const stageCount = new Map<string, number>();
    for (const s of stages) stageCount.set(s, (stageCount.get(s) ?? 0) + 1);
    const topStage = [...stageCount.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topStage) {
      vulnerabilityNotes.push(
        `Punto della sequenza più spesso registrato: ${CHAIN_STAGE_LABELS[topStage[0]] ?? topStage[0]}.`,
      );
    }
  }
  if (!vulnerabilityNotes.length) {
    vulnerabilityNotes.push(insufficientData ? "Dati insufficienti sui momenti di vulnerabilità." : "Nessun pattern evidente nei dati disponibili.");
  }

  const nextObjective = insufficientData
    ? "Questa settimana completa almeno 4 check-in brevi, così i report potranno basarsi su dati reali."
    : topTriggers[0]
      ? `Prepara una protezione concreta per il trigger «${topTriggers[0].name}» e usala in anticipo almeno due volte.`
      : "Continua a praticare «Fermati e prega col cuore» e registra una piccola vittoria al giorno.";

  const checkInCalendar = rangeDates.map((date) => {
    const c = checkins.find((x) => x.date === date);
    return {
      date,
      hasCheckIn: Boolean(c),
      hasEpisode: c ? hasRecordedEpisode(c, preferences) : false,
    };
  });

  return {
    periodType,
    startDate,
    endDate,
    checkInDays,
    pornographyEpisodes,
    masturbationEpisodes,
    daysWithoutEpisodes,
    insufficientData,
    topTriggers,
    vulnerabilityNotes,
    strategiesUsed,
    strategiesWithInterruptions,
    activitiesCompleted: activities.length,
    prayerCheckIns: prayers.length + checkins.filter((c) => c.prayerCompleted === true).length,
    smallVictories: smallVictories.slice(0, 12),
    recurringDifficulties: [...new Set(difficulties)].slice(0, 8),
    nextObjective,
    checkInCalendar,
  };
}
