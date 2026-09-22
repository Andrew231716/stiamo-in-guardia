"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { Card, SectionTitle } from "@/components/ui/Card";
import { formatShortDate } from "@/lib/utils/date";

export default function DiarioPage() {
  const { ready, data } = useApp();
  if (!ready) return <p className="text-fg-muted">Caricamento…</p>;

  const rows = [...data.checkins].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle title="Storico diario" subtitle="Registrazioni modificabili. Nessun dettaglio esplicito richiesto." />
      {!rows.length ? (
        <Card>
          <p className="text-fg-muted">Nessun check-in ancora. Inizia dal giorno precedente.</p>
          <Link href="/check-in" className="mt-3 inline-block text-brand underline">
            Vai al check-in
          </Link>
        </Card>
      ) : (
        rows.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-[family-name:var(--font-fraunces)] text-xl">{formatShortDate(c.date)}</p>
                <p className="mt-1 text-sm text-fg-muted">
                  Pornografia: {c.pornographyStatus} · Masturbazione: {c.masturbationStatus}
                </p>
                <p className="mt-1 text-sm text-fg-muted">
                  Impulsi involontari: {c.involuntaryImpulseStatus} (non conteggiati come ricadute)
                </p>
                {c.smallVictory ? <p className="mt-2 text-sm">Vittoria: {c.smallVictory}</p> : null}
              </div>
              <Link href={`/check-in?date=${c.date}`} className="text-sm text-brand underline">
                Modifica
              </Link>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
