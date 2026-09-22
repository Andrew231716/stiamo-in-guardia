"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { GUIDE_PHRASES, STRATEGY_CATALOG, TRIGGER_CATALOG, CHAIN_STAGE_LABELS } from "@/data/catalog";
import type { ChainStage, DailyCheckin, EpisodeStatus, ImpulseStatus } from "@/lib/types";
import { yesterdayIso } from "@/lib/utils/date";

function CheckInFormInner({ date, existing }: { date: string; existing?: DailyCheckin }) {
  const { upsertCheckin, deleteCheckin } = useApp();

  const [pornographyStatus, setPornographyStatus] = useState<EpisodeStatus>(existing?.pornographyStatus ?? "none");
  const [masturbationStatus, setMasturbationStatus] = useState<EpisodeStatus>(existing?.masturbationStatus ?? "none");
  const [involuntaryImpulseStatus, setInvoluntaryImpulseStatus] = useState<ImpulseStatus>(
    existing?.involuntaryImpulseStatus ?? "prefer_not_to_say",
  );
  const [triggers, setTriggers] = useState<string[]>(existing?.triggers ?? []);
  const [chainStage, setChainStage] = useState<ChainStage>(existing?.chainStage ?? "prefer_not_to_say");
  const [strategiesUsed, setStrategiesUsed] = useState<string[]>(existing?.strategiesUsed ?? []);
  const [smallVictory, setSmallVictory] = useState(existing?.smallVictory ?? "");
  const [improvementNote, setImprovementNote] = useState(existing?.improvementNote ?? "");
  const [prayerCompleted, setPrayerCompleted] = useState<boolean | null>(existing?.prayerCompleted ?? null);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [preventiveAdjustment, setPreventiveAdjustment] = useState(existing?.preventiveAdjustment ?? "");
  const [interruptionPoint, setInterruptionPoint] = useState(existing?.interruptionPoint ?? "");
  const [saved, setSaved] = useState(false);

  const relapse = pornographyStatus === "episode" || masturbationStatus === "episode";

  const toggle = (list: string[], id: string, setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const episodeOptions = useMemo(
    () =>
      [
        { value: "none", label: "Nessun episodio" },
        { value: "episode", label: "Episodio" },
        { value: "prefer_not_to_say", label: "Preferisco non rispondere" },
      ] as const,
    [],
  );

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Check-in del giorno precedente"
        subtitle={`Data: ${date} · circa 1-3 minuti. Puoi saltare ciò che non vuoi rispondere.`}
      />

      <Card>
        <h3 className="font-semibold">Pornografia</h3>
        <div className="mt-3 grid gap-2">
          {episodeOptions.map((o) => (
            <label key={o.value} className="flex items-center gap-3 rounded-xl border border-line px-3 py-3">
              <input
                type="radio"
                name="porn"
                checked={pornographyStatus === o.value}
                onChange={() => setPornographyStatus(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Masturbazione</h3>
        <div className="mt-3 grid gap-2">
          {episodeOptions.map((o) => (
            <label key={o.value} className="flex items-center gap-3 rounded-xl border border-line px-3 py-3">
              <input
                type="radio"
                name="mast"
                checked={masturbationStatus === o.value}
                onChange={() => setMasturbationStatus(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Hai provato impulsi o eccitazione involontaria?</h3>
        <p className="mt-1 text-sm text-fg-muted">Gli impulsi involontari non vengono conteggiati come ricadute.</p>
        <div className="mt-3 grid gap-2">
          {(
            [
              ["yes", "Sì"],
              ["no", "No"],
              ["dont_remember", "Non ricordo"],
              ["prefer_not_to_say", "Preferisco non rispondere"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-3 rounded-xl border border-line px-3 py-3">
              <input
                type="radio"
                name="impulse"
                checked={involuntaryImpulseStatus === value}
                onChange={() => setInvoluntaryImpulseStatus(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </Card>

      {relapse ? (
        <Card className="border-danger-soft/40 bg-accent-soft/30">
          <p className="text-sm leading-relaxed">{GUIDE_PHRASES.relapse}</p>
        </Card>
      ) : null}

      <Card>
        <h3 className="font-semibold">Trigger presenti</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRIGGER_CATALOG.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(triggers, t.id, setTriggers)}
              className={`rounded-full border px-3 py-2 text-sm ${
                triggers.includes(t.id) ? "border-brand bg-brand-soft text-brand" : "border-line"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Punto della sequenza</h3>
        <p className="mt-1 text-sm text-fg-muted">TRIGGER → IMPULSO → TELEFONO → RICERCA → AZIONE</p>
        <select
          className="mt-3 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={chainStage}
          onChange={(e) => setChainStage(e.target.value as ChainStage)}
        >
          {Object.entries(CHAIN_STAGE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Card>

      <Card>
        <h3 className="font-semibold">Strategie utilizzate</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {STRATEGY_CATALOG.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(strategiesUsed, s.id, setStrategiesUsed)}
              className={`rounded-full border px-3 py-2 text-sm ${
                strategiesUsed.includes(s.id) ? "border-brand bg-brand-soft text-brand" : "border-line"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <label className="font-semibold" htmlFor="victory">
          Piccola vittoria
        </label>
        <textarea
          id="victory"
          className="mt-3 min-h-20 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={smallVictory}
          onChange={(e) => setSmallVictory(e.target.value)}
          placeholder="Es. ho riconosciuto un trigger e posato il telefono"
        />
      </Card>

      <Card>
        <label className="font-semibold" htmlFor="improve">
          Cosa vorrei migliorare oggi
        </label>
        <textarea
          id="improve"
          className="mt-3 min-h-20 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={improvementNote}
          onChange={(e) => setImprovementNote(e.target.value)}
        />
      </Card>

      <Card>
        <h3 className="font-semibold">Sei riuscito a fermarti e pregare col cuore?</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            [true, "Sì"],
            [false, "No"],
            [null, "Preferisco non rispondere"],
          ].map(([value, label]) => (
            <button
              key={String(label)}
              type="button"
              className={`rounded-full border px-3 py-2 text-sm ${
                prayerCompleted === value ? "border-brand bg-brand-soft text-brand" : "border-line"
              }`}
              onClick={() => setPrayerCompleted(value as boolean | null)}
            >
              {label as string}
            </button>
          ))}
        </div>
      </Card>

      {relapse ? (
        <>
          <Card>
            <label className="font-semibold" htmlFor="interrupt">
              Dove sarebbe stato possibile interrompere?
            </label>
            <textarea
              id="interrupt"
              className="mt-3 min-h-20 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={interruptionPoint}
              onChange={(e) => setInterruptionPoint(e.target.value)}
            />
          </Card>
          <Card>
            <label className="font-semibold" htmlFor="prevent">
              Aggiustamento preventivo
            </label>
            <textarea
              id="prevent"
              className="mt-3 min-h-20 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={preventiveAdjustment}
              onChange={(e) => setPreventiveAdjustment(e.target.value)}
            />
          </Card>
        </>
      ) : null}

      <Card>
        <label className="font-semibold" htmlFor="notes">
          Note personali (facoltative)
        </label>
        <p className="mt-1 text-sm text-fg-muted">Niente dettagli espliciti né nomi di persone.</p>
        <textarea
          id="notes"
          className="mt-3 min-h-24 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Card>

      <Button
        className="w-full"
        onClick={async () => {
          await upsertCheckin({
            id: existing?.id,
            date,
            pornographyStatus,
            masturbationStatus,
            involuntaryImpulseStatus,
            triggers,
            chainStage,
            strategiesUsed,
            smallVictory,
            improvementNote,
            prayerCompleted,
            notes,
            preventiveAdjustment,
            interruptionPoint,
          });
          setSaved(true);
        }}
      >
        Salva check-in
      </Button>

      {existing ? (
        <Button
          variant="ghost"
          className="w-full"
          onClick={async () => {
            await deleteCheckin(existing.id);
            setSaved(false);
          }}
        >
          Elimina questa registrazione
        </Button>
      ) : null}

      {saved ? <p className="text-center text-sm text-ok">Check-in salvato. Puoi modificarlo in qualsiasi momento.</p> : null}
    </div>
  );
}

function CheckInForm() {
  const params = useSearchParams();
  const date = params.get("date") || yesterdayIso();
  const { ready, getCheckinForDate } = useApp();
  const existing = getCheckinForDate(date);

  if (!ready) return <p className="text-fg-muted">Caricamento…</p>;

  return <CheckInFormInner key={`${date}-${existing?.id ?? "new"}`} date={date} existing={existing} />;
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<p className="text-fg-muted">Caricamento check-in…</p>}>
      <CheckInForm />
    </Suspense>
  );
}
