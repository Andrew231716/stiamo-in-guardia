"use client";

import { SOURCES } from "@/data/sources";
import { Card, SectionTitle } from "@/components/ui/Card";

export default function FontiPage() {
  const spiritual = SOURCES.filter((s) => s.sourceType === "spiritual");
  const clinical = SOURCES.filter((s) => s.sourceType === "clinical");

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Fonti e approfondimenti"
        subtitle="Solo collegamenti ufficiali. Le convinzioni religiose non sono presentate come conclusioni scientifiche."
      />

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Fonti spirituali</h3>
        <div className="mt-4 space-y-4">
          {spiritual.map((s) => (
            <article key={s.id} className="rounded-2xl border border-line p-4">
              <h4 className="font-semibold">{s.title}</h4>
              <p className="text-sm text-fg-muted">{s.organization}</p>
              <p className="mt-2 text-sm text-fg-muted">{s.description}</p>
              <a className="mt-2 inline-block text-sm text-brand underline" href={s.url} target="_blank" rel="noreferrer">
                Apri fonte ufficiale
              </a>
              {s.lastVerifiedAt ? (
                <p className="mt-1 text-xs text-fg-muted">Consultato/verificato: {s.lastVerifiedAt}</p>
              ) : null}
            </article>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Fonti psicologiche / istituzionali</h3>
        <div className="mt-4 space-y-4">
          {clinical.map((s) => (
            <article key={s.id} className="rounded-2xl border border-line p-4">
              <h4 className="font-semibold">{s.title}</h4>
              <p className="text-sm text-fg-muted">{s.organization}</p>
              <p className="mt-2 text-sm text-fg-muted">{s.description}</p>
              <a className="mt-2 inline-block text-sm text-brand underline" href={s.url} target="_blank" rel="noreferrer">
                Apri fonte ufficiale
              </a>
              {s.lastVerifiedAt ? (
                <p className="mt-1 text-xs text-fg-muted">Consultato/verificato: {s.lastVerifiedAt}</p>
              ) : null}
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
