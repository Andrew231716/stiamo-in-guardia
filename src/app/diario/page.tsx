"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { TRIGGER_CATALOG, STRATEGY_CATALOG, CHAIN_STAGE_LABELS } from "@/data/catalog";
import { ACTIVITY_CATEGORY_LABELS } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/date";
import {
  EPISODE_STATUS_LABELS,
  IMPULSE_STATUS_LABELS,
  strategyName,
  triggerName,
} from "@/lib/utils/labels";

type Tab = "checkins" | "activities" | "prayers";

export default function DiarioPage() {
  const { ready, data } = useApp();
  const [tab, setTab] = useState<Tab>("checkins");

  const strategyCatalog = useMemo(
    () => [...STRATEGY_CATALOG, ...data.customStrategies],
    [data.customStrategies],
  );

  if (!ready) return <p className="text-fg-muted">Caricamento…</p>;

  const checkins = [...data.checkins].sort((a, b) => b.date.localeCompare(a.date));
  const activities = [...data.activities].sort((a, b) => b.date.localeCompare(a.date));
  const prayers = [...data.prayers].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Storico diario"
        subtitle="Check-in, attività e preghiere. Tutto modificabile. Nessun dettaglio esplicito richiesto."
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["checkins", `Check-in (${checkins.length})`],
            ["activities", `Attività (${activities.length})`],
            ["prayers", `Preghiere (${prayers.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-2xl border px-3 py-2 text-sm ${
              tab === id ? "border-brand bg-brand-soft text-brand" : "border-line text-fg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "checkins" ? (
        !checkins.length ? (
          <Card>
            <p className="text-fg-muted">Nessun check-in ancora. Inizia dal giorno precedente.</p>
            <Link href="/check-in" className="mt-3 inline-block text-brand underline">
              Vai al check-in
            </Link>
          </Card>
        ) : (
          checkins.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-fraunces)] text-xl">{formatShortDate(c.date)}</p>
                  <p className="mt-1 text-sm text-fg-muted">
                    Pornografia: {EPISODE_STATUS_LABELS[c.pornographyStatus]}
                  </p>
                  <p className="text-sm text-fg-muted">
                    Masturbazione: {EPISODE_STATUS_LABELS[c.masturbationStatus]}
                  </p>
                  <p className="text-sm text-fg-muted">
                    Impulsi involontari: {IMPULSE_STATUS_LABELS[c.involuntaryImpulseStatus]} (non sono
                    ricadute)
                  </p>
                  {c.chainStage && c.chainStage !== "prefer_not_to_say" ? (
                    <p className="mt-1 text-sm text-fg-muted">
                      Sequenza: {CHAIN_STAGE_LABELS[c.chainStage] ?? c.chainStage}
                    </p>
                  ) : null}
                  {c.triggers.length ? (
                    <p className="mt-2 text-sm">
                      Trigger:{" "}
                      {c.triggers.map((t) => triggerName(t, TRIGGER_CATALOG)).join(", ")}
                    </p>
                  ) : null}
                  {c.strategiesUsed.length ? (
                    <p className="mt-1 text-sm">
                      Strategie:{" "}
                      {c.strategiesUsed.map((s) => strategyName(s, strategyCatalog)).join(", ")}
                    </p>
                  ) : null}
                  {c.smallVictory ? (
                    <p className="mt-2 text-sm text-ok">Vittoria: {c.smallVictory}</p>
                  ) : null}
                  {c.improvementNote ? (
                    <p className="mt-1 text-sm text-fg-muted">Da migliorare: {c.improvementNote}</p>
                  ) : null}
                </div>
                <Link href={`/check-in?date=${c.date}`} className="shrink-0 text-sm text-brand underline">
                  Modifica
                </Link>
              </div>
            </Card>
          ))
        )
      ) : null}

      {tab === "activities" ? (
        !activities.length ? (
          <Card>
            <p className="text-fg-muted">Nessuna attività ancora.</p>
            <Link href="/attivita" className="mt-3 inline-block text-brand underline">
              Apri attività di oggi
            </Link>
          </Card>
        ) : (
          activities.map((a) => (
            <Card key={a.id}>
              <p className="font-[family-name:var(--font-fraunces)] text-xl">{formatShortDate(a.date)}</p>
              <p className="mt-1 font-medium">{a.title}</p>
              <p className="mt-1 text-sm text-fg-muted">
                {ACTIVITY_CATEGORY_LABELS[a.category]} ·{" "}
                {a.completedAt ? "Completata" : "In corso / non completata"}
              </p>
              {a.personalResponse ? (
                <p className="mt-2 text-sm text-fg-muted line-clamp-3">{a.personalResponse}</p>
              ) : null}
              {a.date === new Date().toISOString().slice(0, 10) ? (
                <Link href="/attivita" className="mt-3 inline-block text-sm text-brand underline">
                  Continua
                </Link>
              ) : null}
            </Card>
          ))
        )
      ) : null}

      {tab === "prayers" ? (
        !prayers.length ? (
          <Card>
            <p className="text-fg-muted">Nessun momento di preghiera registrato.</p>
            <Link href="/preghiera" className="mt-3 inline-block text-brand underline">
              Apri scheda preghiera
            </Link>
          </Card>
        ) : (
          prayers.map((p) => (
            <Card key={p.id}>
              <p className="font-[family-name:var(--font-fraunces)] text-xl">{formatShortDate(p.date)}</p>
              <p className="mt-1 text-sm text-fg-muted">
                {p.completed ? "Momento registrato" : "Bozza"} · {p.verseReference}
              </p>
              {p.feelingNote ? <p className="mt-2 text-sm text-fg-muted">{p.feelingNote}</p> : null}
              {p.date === new Date().toISOString().slice(0, 10) ? (
                <Link href="/preghiera" className="mt-3 inline-block text-sm text-brand underline">
                  Apri
                </Link>
              ) : null}
            </Card>
          ))
        )
      ) : null}

      <Link href="/report">
        <Button variant="secondary" className="w-full">
          Vai ai report
        </Button>
      </Link>
    </div>
  );
}
