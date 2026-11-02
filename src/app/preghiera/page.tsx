"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ScriptureLink } from "@/components/bible/ScriptureLink";
import { pickPrayerVerseForDate } from "@/data/verses";
import type { PrayerEntry } from "@/lib/types";
import { todayIso } from "@/lib/utils/date";

function PrayerForm({
  date,
  verseReference,
  verseNote,
  existing,
}: {
  date: string;
  verseReference: string;
  verseNote: string;
  existing?: PrayerEntry;
}) {
  const { upsertPrayer } = useApp();
  const [writtenPrayer, setWrittenPrayer] = useState(existing?.writtenPrayer ?? "");
  const [feelingNote, setFeelingNote] = useState(existing?.feelingNote ?? "");
  const [done, setDone] = useState(existing?.completed ?? false);
  const [saving, setSaving] = useState(false);

  const markDone = async (withText: boolean) => {
    setSaving(true);
    try {
      await upsertPrayer({
        date,
        verseReference,
        writtenPrayer: withText ? writtenPrayer : existing?.writtenPrayer ?? "",
        feelingNote: withText ? feelingNote : existing?.feelingNote ?? "",
        completed: true,
      });
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Fermati e prega col cuore"
        subtitle="Un momento sincero basta. Non serve scrivere."
      />

      <Card>
        <p className="leading-relaxed">
          Fermati, posa il telefono se serve, rivolgiti a Geova, poi scegli il passo successivo.
        </p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Versetto</p>
        <div className="mt-2">
          <ScriptureLink reference={verseReference} size="lg" />
        </div>
        <p className="mt-2 text-sm text-fg-muted">{verseNote}</p>
      </Card>

      <Button className="w-full" disabled={saving} onClick={() => void markDone(false)}>
        {saving ? "Salvataggio…" : "Ho pregato"}
      </Button>

      <details className="rounded-[var(--radius)] border border-line bg-bg-elevated/60 px-4 py-3">
        <summary className="cursor-pointer font-semibold">Scrivere qualcosa (facoltativo)</summary>
        <label className="mt-3 block text-sm font-medium" htmlFor="prayer">
          Preghiera
        </label>
        <textarea
          id="prayer"
          className="mt-2 min-h-28 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={writtenPrayer}
          onChange={(e) => setWrittenPrayer(e.target.value)}
          placeholder="Scrivi liberamente…"
        />
        <label className="mt-3 block text-sm font-medium" htmlFor="feeling">
          Come ti sei sentito
        </label>
        <textarea
          id="feeling"
          className="mt-2 min-h-20 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={feelingNote}
          onChange={(e) => setFeelingNote(e.target.value)}
        />
        <Button
          className="mt-3 w-full"
          variant="secondary"
          disabled={saving}
          onClick={() => void markDone(true)}
        >
          Salva anche il testo
        </Button>
      </details>

      {done ? (
        <>
          <p className="text-center text-sm text-ok">Momento di preghiera registrato.</p>
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Torna a Oggi
            </Button>
          </Link>
        </>
      ) : null}
    </div>
  );
}

export default function PreghieraPage() {
  const { ready, getPrayerForDate } = useApp();
  const date = todayIso();
  const verse = useMemo(() => pickPrayerVerseForDate(date), [date]);
  const existing = getPrayerForDate(date);

  if (!ready) return <p className="text-fg-muted">Caricamento…</p>;

  return (
    <PrayerForm
      key={existing?.id ?? date}
      date={date}
      verseReference={verse.reference}
      verseNote={verse.note}
      existing={existing}
    />
  );
}
