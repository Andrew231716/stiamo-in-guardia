"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
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

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Fermati e prega col cuore"
        subtitle="Aiuto spirituale e scelta personale, non una tecnica automatica."
      />

      <Card>
        <p className="text-sm text-fg-muted">Richiamo spirituale</p>
        <p className="mt-2 leading-relaxed">
          Quando riconosci una tentazione: fermati, posa il telefono se necessario, rivolgiti sinceramente a Geova, poi
          scegli il passo successivo.
        </p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Versetto pertinente</p>
        <p className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl text-brand">{verseReference}</p>
        <p className="mt-1 text-sm text-fg-muted">{verseNote}</p>
      </Card>

      <Card>
        <label className="font-semibold" htmlFor="prayer">
          Preghiera personale scritta
        </label>
        <textarea
          id="prayer"
          className="mt-3 min-h-32 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={writtenPrayer}
          onChange={(e) => setWrittenPrayer(e.target.value)}
          placeholder="Scrivi liberamente ciò che vuoi dire a Geova…"
        />
      </Card>

      <Card>
        <label className="font-semibold" htmlFor="feeling">
          Resoconto facoltativo di ciò che hai provato
        </label>
        <textarea
          id="feeling"
          className="mt-3 min-h-24 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={feelingNote}
          onChange={(e) => setFeelingNote(e.target.value)}
        />
      </Card>

      <Button
        className="w-full"
        onClick={async () => {
          await upsertPrayer({
            date,
            verseReference,
            writtenPrayer,
            feelingNote,
            completed: true,
          });
          setDone(true);
        }}
      >
        Ho dedicato un momento alla preghiera
      </Button>

      {done ? (
        <p className="text-center text-sm text-ok">Momento di preghiera registrato. Grazie per la sincerità.</p>
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
