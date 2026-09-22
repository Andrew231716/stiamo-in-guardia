"use client";

import { SOURCES, SOURCE_TOPIC_LABELS, getSpiritualSourcesByTopic } from "@/data/sources";
import { Card, SectionTitle } from "@/components/ui/Card";
import type { SourceItem } from "@/lib/types";

const TOPIC_ORDER: NonNullable<SourceItem["topics"]>[number][] = [
  "rinnovare_mente",
  "amare_bene",
  "matrimonio_pazienza",
  "padronanza",
  "pensieri_casti",
  "tentazione",
  "purezza",
  "pornografia",
];

function SourceCard({ s }: { s: SourceItem }) {
  return (
    <article className="rounded-2xl border border-line p-4">
      <h4 className="font-semibold text-brand-deep">{s.title}</h4>
      <p className="text-sm text-fg-muted">{s.organization}</p>
      <p className="mt-2 text-sm text-fg-muted">{s.description}</p>
      <a className="mt-2 inline-block text-sm text-brand underline" href={s.url} target="_blank" rel="noreferrer">
        Apri fonte ufficiale
      </a>
      {s.lastVerifiedAt ? (
        <p className="mt-1 text-xs text-fg-muted">Consultato/verificato: {s.lastVerifiedAt}</p>
      ) : null}
    </article>
  );
}

export default function FontiPage() {
  const clinical = SOURCES.filter((s) => s.sourceType === "clinical");
  const portals = SOURCES.filter(
    (s) => s.sourceType === "spiritual" && (!s.topics || s.topics.length === 0),
  );

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Fonti e approfondimenti"
        subtitle="Pubblicazioni ufficiali per rinnovare la mente, coltivare padronanza di sé, amare ciò che è bene e odiare ciò che è male. Le convinzioni religiose non sono presentate come conclusioni scientifiche."
      />

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Portali ufficiali</h3>
        <div className="mt-4 space-y-4">
          {portals.map((s) => (
            <SourceCard key={s.id} s={s} />
          ))}
        </div>
      </Card>

      {TOPIC_ORDER.map((topic) => {
        const items = getSpiritualSourcesByTopic(topic);
        if (!items.length) return null;
        return (
          <Card key={topic}>
            <h3 className="font-[family-name:var(--font-fraunces)] text-xl">{SOURCE_TOPIC_LABELS[topic]}</h3>
            <div className="mt-4 space-y-4">
              {items.map((s) => (
                <SourceCard key={`${topic}-${s.id}`} s={s} />
              ))}
            </div>
          </Card>
        );
      })}

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Fonti psicologiche / istituzionali</h3>
        <p className="mt-1 text-sm text-fg-muted">
          Contesto generale di salute mentale. Non sostituiscono un professionista e non sono equivalenti alle
          pubblicazioni spirituali.
        </p>
        <div className="mt-4 space-y-4">
          {clinical.map((s) => (
            <SourceCard key={s.id} s={s} />
          ))}
        </div>
      </Card>
    </div>
  );
}
