import type { EpisodeStatus, ImpulseStatus } from "@/lib/types";

export const EPISODE_STATUS_LABELS: Record<EpisodeStatus, string> = {
  none: "Nessun episodio",
  episode: "Episodio",
  prefer_not_to_say: "Preferisco non rispondere",
};

export const IMPULSE_STATUS_LABELS: Record<ImpulseStatus, string> = {
  yes: "Sì",
  no: "No",
  dont_remember: "Non ricordo",
  prefer_not_to_say: "Preferisco non rispondere",
};

export function triggerName(id: string, catalog: { id: string; name: string }[]): string {
  return catalog.find((t) => t.id === id)?.name ?? id;
}

export function strategyName(id: string, catalog: { id: string; name: string }[]): string {
  return catalog.find((s) => s.id === id)?.name ?? id;
}

/** Giorni consecutivi all'indietro senza episodi di pornografia/masturbazione (solo su giorni con check-in). */
export function streakWithoutEpisodes(
  checkins: Array<{
    date: string;
    pornographyStatus: EpisodeStatus;
    masturbationStatus: EpisodeStatus;
  }>,
  relapse: { countPornography: boolean; countMasturbation: boolean },
): number {
  const byDate = new Map(checkins.map((c) => [c.date, c]));
  const dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  for (const date of dates) {
    const c = byDate.get(date)!;
    const porn = relapse.countPornography && c.pornographyStatus === "episode";
    const mast = relapse.countMasturbation && c.masturbationStatus === "episode";
    if (porn || mast) break;
    if (c.pornographyStatus === "prefer_not_to_say" && c.masturbationStatus === "prefer_not_to_say") {
      // non spezza né allunga: salta
      continue;
    }
    streak += 1;
  }
  return streak;
}
