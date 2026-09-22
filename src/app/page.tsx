"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp, useYesterdayCheckinNeeded } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ACTIVITY_CATEGORY_LABELS } from "@/lib/types";
import { formatDisplayDate, greetingForHour, lastNDates, todayIso } from "@/lib/utils/date";
import { pickVerseForDate } from "@/data/verses";
import { GUIDE_PHRASES } from "@/data/catalog";

export default function DashboardPage() {
  const { ready, data, ensureTodayActivity, getActivityForDate, getPrayerForDate, getCheckinForDate } = useApp();
  const { needed, yesterday } = useYesterdayCheckinNeeded();
  const [loadingActivity, setLoadingActivity] = useState(false);
  const date = todayIso();
  const verse = useMemo(() => pickVerseForDate(date), [date]);
  const activity = getActivityForDate(date);
  const prayer = getPrayerForDate(date);
  const hour = new Date().getHours();

  useEffect(() => {
    if (!ready) return;
    void ensureTodayActivity();
  }, [ready, ensureTodayActivity]);

  const week = lastNDates(7);
  const weekSummary = week.map((d) => {
    const c = getCheckinForDate(d);
    const a = getActivityForDate(d);
    return {
      date: d,
      checkIn: Boolean(c),
      activityDone: Boolean(a?.completedAt),
      episode:
        c?.pornographyStatus === "episode" || c?.masturbationStatus === "episode",
    };
  });

  const recentVictory = [...data.checkins]
    .reverse()
    .find((c) => c.smallVictory?.trim())
    ?.smallVictory;

  const vulnerableHint =
    data.preferences.vulnerableHours.length > 0
      ? `Promemoria preventivo: nei momenti ${data.preferences.vulnerableHours.join(", ")} prepara in anticipo telefono e ambiente.`
      : null;

  if (!ready) {
    return <p className="text-fg-muted">Caricamento del diario locale…</p>;
  }

  if (data.preferences.tiredMode) {
    return (
      <div className="space-y-4 animate-fade-up">
        <Card>
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-brand">Modalità semplice attiva</h2>
          <p className="mt-2 text-fg-muted">
            Se la mano sta andando automaticamente verso il telefono per cercare materiale sessuale, posa il telefono fuori
            portata e alzati. Non aspettare che l&apos;impulso sparisca.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/stanchezza">
              <Button className="w-full">Apri modalità semplice</Button>
            </Link>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                /* stay */
              }}
            >
              Resta sulla dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <Card className="overflow-hidden">
        <div className="space-y-3">
          <p className="text-sm capitalize text-fg-muted">{formatDisplayDate(date)}</p>
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-fg">
            {greetingForHour(hour, data.preferences.displayName)}
          </h2>
          <p className="text-fg-muted">{GUIDE_PHRASES.impulse}</p>
        </div>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Versetto del giorno</p>
        <p className="mt-2 font-[family-name:var(--font-fraunces)] text-xl text-brand">{verse.reference}</p>
        <p className="mt-1 text-sm text-fg-muted">{verse.note}</p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Obiettivo quotidiano</p>
        <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl">Fermati e prega col cuore</h3>
        <p className="mt-2 text-sm text-fg-muted">
          La preghiera è un aiuto spirituale e una scelta personale, non una tecnica che fa sparire automaticamente
          l&apos;impulso.
        </p>
        <p className="mt-3 text-sm">
          Stato:{" "}
          <span className={prayer?.completed ? "text-ok" : "text-fg-muted"}>
            {prayer?.completed ? "Momento di preghiera registrato" : "Ancora da registrare"}
          </span>
        </p>
        <Link href="/preghiera" className="mt-4 block">
          <Button variant="secondary" className="w-full">
            Apri scheda preghiera
          </Button>
        </Link>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Attività spirituale del giorno</p>
        <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl">
          {activity?.title ?? "Preparazione…"}
        </h3>
        {activity ? (
          <>
            <p className="mt-1 text-sm text-fg-muted">
              {ACTIVITY_CATEGORY_LABELS[activity.category]} · circa {activity.durationMinutes} min
            </p>
            <p className="mt-3 text-sm text-fg-muted">{activity.objective}</p>
            <p className="mt-3 text-sm">
              Stato:{" "}
              <span className={activity.completedAt ? "text-ok" : "text-fg-muted"}>
                {activity.completedAt ? "Completata" : "Da iniziare"}
              </span>
            </p>
          </>
        ) : null}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link href="/attivita" className="flex-1">
            <Button
              className="w-full"
              disabled={loadingActivity}
              onClick={() => {
                setLoadingActivity(true);
                void ensureTodayActivity().finally(() => setLoadingActivity(false));
              }}
            >
              Inizia attività
            </Button>
          </Link>
          <Link href={`/check-in?date=${yesterday}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              Registra il giorno precedente
            </Button>
          </Link>
        </div>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Check-in quotidiano</p>
        <p className="mt-2 text-sm">
          {needed
            ? `Manca ancora il check-in di ${yesterday}.`
            : "Check-in del giorno precedente presente."}
        </p>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {weekSummary.map((d) => (
            <div key={d.date} className="text-center">
              <div
                className={`mx-auto h-9 w-9 rounded-full border ${
                  d.checkIn ? "border-ok bg-brand-soft" : "border-line bg-bg"
                }`}
                title={d.date}
              />
              <p className="mt-1 text-[10px] text-fg-muted">{d.date.slice(8)}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-fg-muted">Ultimi 7 giorni: cerchio pieno = check-in registrato.</p>
      </Card>

      {recentVictory ? (
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Piccola vittoria recente</p>
          <p className="mt-2 text-fg">{recentVictory}</p>
        </Card>
      ) : null}

      {vulnerableHint ? (
        <Card className="border-accent/30 bg-accent-soft/40">
          <p className="text-sm">{vulnerableHint}</p>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/report/settimanale">
          <Button variant="secondary" className="w-full">
            Report settimanale
          </Button>
        </Link>
        <Link href="/report/mensile">
          <Button variant="secondary" className="w-full">
            Report mensile
          </Button>
        </Link>
      </div>

      <p className="pb-2 text-center text-xs text-fg-muted">{GUIDE_PHRASES.disclaimer}</p>
    </div>
  );
}
