import { SOURCES } from "@/data/sources";
import type { AiCoachSourceRef } from "@/lib/ai/types";
import type { SourceItem } from "@/lib/types";

const DISCLAIMER =
  "Analisi di supporto personale. Le indicazioni spirituali rimandano a JW.org / WOL; quelle psicologiche a siti ufficiali. Non sostituisce un medico, uno psicologo o un responsabile spirituale. Non inventa citazioni.";

export function coachDisclaimer(): string {
  return DISCLAIMER;
}

type Topic = NonNullable<SourceItem["topics"]>[number];

export function pickCoachSources(topics: Array<Topic | "clinical">): AiCoachSourceRef[] {
  const spiritualTopics = topics.filter((t): t is Topic => t !== "clinical");
  const spiritual = SOURCES.filter(
    (s) => s.sourceType === "spiritual" && s.topics?.some((t) => spiritualTopics.includes(t)),
  );
  const clinical = SOURCES.filter((s) => s.sourceType === "clinical");

  const picked: AiCoachSourceRef[] = [];
  for (const s of [...spiritual.slice(0, 3), ...clinical.slice(0, 2)]) {
    picked.push({
      title: s.title,
      url: s.url,
      organization: s.organization,
      sourceType: s.sourceType,
    });
  }

  if (!picked.some((p) => p.url.includes("2024485"))) {
    const base = SOURCES.find((s) => s.id === "jw-stiamo-in-guardia");
    if (base) {
      picked.unshift({
        title: base.title,
        url: base.url,
        organization: base.organization,
        sourceType: base.sourceType,
      });
    }
  }

  return picked.slice(0, 5);
}

export function sourcesCatalogForPrompt(): string {
  return SOURCES.map(
    (s) =>
      `- [${s.sourceType}] ${s.title} | ${s.organization} | ${s.url} | ${s.description}`,
  ).join("\n");
}
