"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import {
  GUIDE_PHRASES,
  STRATEGY_CATALOG,
  TRIGGER_CATALOG,
  CHAIN_STAGE_LABELS,
  PATIENCE_FOCUS_TRIGGER_IDS,
} from "@/data/catalog";
import type { ChainStage, DailyCheckin, EpisodeStatus, ImpulseStatus } from "@/lib/types";
import { yesterdayIso } from "@/lib/utils/date";
import { buildCheckinInsight } from "@/lib/reports/checkinInsight";
import { CheckinInsightCard } from "@/components/reports/CheckinInsightCard";
import { AiCoachPanel } from "@/components/ai/AiCoachPanel";

const EPISODE_OPTIONS = [
  { value: "none" as const, label: "Nessun episodio" },
  { value: "episode" as const, label: "Episodio" },
  { value: "prefer_not_to_say" as const, label: "Preferisco non rispondere" },
];

function ChoiceRow<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-3 grid gap-2">
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-3 rounded-xl border border-line px-3 py-3">
          <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function CheckInFormInner({ date, existing }: { date: string; existing?: DailyCheckin }) {
  const { upsertCheckin, deleteCheckin, data } = useApp();
  const [step, setStep] = useState(existing ? 3 : 0);

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
  const [saved, setSaved] = useState(Boolean(existing));
  const [showInsight, setShowInsight] = useState(Boolean(existing));
  const [saving, setSaving] = useState(false);

  const strategies = useMemo(
    () => [...STRATEGY_CATALOG, ...data.customStrategies],
    [data.customStrategies],
  );

  const relapse = pornographyStatus === "episode" || masturbationStatus === "episode";
  const needsPatienceFocus = triggers.some((t) =>
    (PATIENCE_FOCUS_TRIGGER_IDS as readonly string[]).includes(t),
  );

  const insight = useMemo(
    () =>
      buildCheckinInsight(
        {
          pornographyStatus,
          masturbationStatus,
          involuntaryImpulseStatus,
          triggers,
          chainStage,
          strategiesUsed,
          smallVictory,
          prayerCompleted,
          interruptionPoint,
        },
        data.customStrategies,
      ),
    [
      pornographyStatus,
      masturbationStatus,
      involuntaryImpulseStatus,
      triggers,
      chainStage,
      strategiesUsed,
      smallVictory,
      prayerCompleted,
      interruptionPoint,
      data.customStrategies,
    ],
  );

  const toggle = (list: string[], id: string, setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const save = async () => {
    setSaving(true);
    try {
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
      setShowInsight(true);
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle title="Check-in" subtitle={`Data: ${date} · tre passi brevi`} />

      <div className="flex gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= Math.min(step, 2) ? "bg-brand" : "bg-line"}`}
          />
        ))}
      </div>

      {step === 0 ? (
        <>
          <Card>
            <h3 className="font-semibold">Pornografia</h3>
            <ChoiceRow
              name="porn"
              value={pornographyStatus}
              options={EPISODE_OPTIONS}
              onChange={setPornographyStatus}
            />
          </Card>
          <Card>
            <h3 className="font-semibold">Masturbazione</h3>
            <ChoiceRow
              name="mast"
              value={masturbationStatus}
              options={EPISODE_OPTIONS}
              onChange={setMasturbationStatus}
            />
          </Card>
          <Card>
            <h3 className="font-semibold">Impulsi involontari?</h3>
            <p className="mt-1 text-sm text-fg-muted">Non contano come ricadute.</p>
            <ChoiceRow
              name="impulse"
              value={involuntaryImpulseStatus}
              options={[
                { value: "yes", label: "Sì" },
                { value: "no", label: "No" },
                { value: "dont_remember", label: "Non ricordo" },
                { value: "prefer_not_to_say", label: "Preferisco non rispondere" },
              ]}
              onChange={setInvoluntaryImpulseStatus}
            />
          </Card>
          {relapse ? (
            <Card className="border-danger-soft/40 bg-accent-soft/30">
              <p className="text-sm leading-relaxed">{GUIDE_PHRASES.relapse}</p>
            </Card>
          ) : null}
          <Button className="w-full" onClick={() => setStep(1)}>
            Continua
          </Button>
          <Button variant="ghost" className="w-full" disabled={saving} onClick={() => void save()}>
            Salva e chiudi qui
          </Button>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <Card>
            <h3 className="font-semibold">Trigger (facoltativo)</h3>
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
          {needsPatienceFocus ? (
            <Card className="border-brand/25 bg-brand-soft/30">
              <p className="text-sm text-fg-muted">{GUIDE_PHRASES.patienceFocus}</p>
              <Link href="/frustrazione" className="mt-3 block">
                <Button variant="secondary" className="w-full">
                  Aiuto immediato
                </Button>
              </Link>
            </Card>
          ) : null}
          <Card>
            <h3 className="font-semibold">Punto della sequenza</h3>
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
            <h3 className="font-semibold">Strategie usate</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {strategies.map((s) => (
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
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" className="w-full" onClick={() => setStep(0)}>
              Indietro
            </Button>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continua
            </Button>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Card>
            <label className="font-semibold" htmlFor="victory">
              Piccola vittoria
            </label>
            <textarea
              id="victory"
              className="mt-3 min-h-20 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={smallVictory}
              onChange={(e) => setSmallVictory(e.target.value)}
              placeholder="Es. ho posato il telefono"
            />
          </Card>
          <Card>
            <h3 className="font-semibold">Sei riuscito a pregare col cuore?</h3>
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
                  Dove potevi interrompere?
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
                  Aggiustamento per la prossima volta
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
          <details className="rounded-[var(--radius)] border border-line bg-bg-elevated/60 px-4 py-3">
            <summary className="cursor-pointer font-semibold">Altro (facoltativo)</summary>
            <label className="mt-3 block text-sm font-medium" htmlFor="improve">
              Cosa vorrei migliorare
            </label>
            <textarea
              id="improve"
              className="mt-2 min-h-20 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={improvementNote}
              onChange={(e) => setImprovementNote(e.target.value)}
            />
            <label className="mt-3 block text-sm font-medium" htmlFor="notes">
              Note
            </label>
            <p className="mt-1 text-xs text-fg-muted">Niente dettagli espliciti né nomi.</p>
            <textarea
              id="notes"
              className="mt-2 min-h-20 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </details>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" className="w-full" onClick={() => setStep(1)}>
              Indietro
            </Button>
            <Button className="w-full" disabled={saving} onClick={() => void save()}>
              {saving ? "Salvataggio…" : "Salva check-in"}
            </Button>
          </div>
        </>
      ) : null}

      {step === 3 || (showInsight && saved) ? (
        <>
          <p className="text-center text-sm text-ok">Check-in salvato.</p>
          {showInsight ? <CheckinInsightCard insight={insight} /> : null}
          {showInsight ? (
            <AiCoachPanel
              input={{
                kind: "checkin",
                date,
                pornographyStatus,
                masturbationStatus,
                involuntaryImpulseStatus,
                triggers,
                chainStage,
                strategiesUsed,
                smallVictory: smallVictory || undefined,
                improvementNote: improvementNote || undefined,
                prayerCompleted,
                interruptionPoint: interruptionPoint || undefined,
                preventiveAdjustment: preventiveAdjustment || undefined,
                notesSnippet: notes.trim() ? notes.trim().slice(0, 400) : undefined,
              }}
            />
          ) : null}
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Torna a Oggi
            </Button>
          </Link>
          {existing ? (
            <Button
              variant="ghost"
              className="w-full"
              onClick={async () => {
                await deleteCheckin(existing.id);
                setSaved(false);
                setShowInsight(false);
                setStep(0);
              }}
            >
              Elimina questa registrazione
            </Button>
          ) : null}
          <Button variant="ghost" className="w-full" onClick={() => setStep(0)}>
            Modifica risposte
          </Button>
        </>
      ) : null}
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
