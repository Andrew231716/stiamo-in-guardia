"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp, useYesterdayCheckinNeeded } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { BrandLockup, LogoMark } from "@/components/brand/Logo";
import { ScriptureLink } from "@/components/bible/ScriptureLink";
import { getFeaturedReading } from "@/data/sources";
import { ACTIVITY_CATEGORY_LABELS } from "@/lib/types";
import { formatDisplayDate, greetingForHour, lastNDates, todayIso } from "@/lib/utils/date";
import { pickVerseForDate } from "@/data/verses";
import { GUIDE_PHRASES } from "@/data/catalog";
import { streakWithoutEpisodes } from "@/lib/utils/labels";

export default function DashboardPage() {
  const { ready, data, ensureTodayActivity, getActivityForDate, getPrayerForDate, getCheckinForDate } = useApp();
  const { needed, yesterday } = useYesterdayCheckinNeeded();
  const [loadingActivity, setLoadingActivity] = useState(false);
  const date = todayIso();
  const verse = useMemo(() => pickVerseForDate(date), [date]);
  const activity = getActivityForDate(date);
  const prayer = getPrayerForDate(date);
  const hour = new Date().getHours();
  const streak = useMemo(
    () => streakWithoutEpisodes(data.checkins, data.preferences.relapseDefinition),
    [data.checkins, data.preferences.relapseDefinition],
  );

  useEffect(() => {
    if (!ready) return;
    void ensureTodayActivity();
  }, [ready, ensureTodayActivity]);

  const week = lastNDates(7);
  const weekSummary = week.map((d) => {
    const c = getCheckinForDate(d);
    return {
      date: d,
      checkIn: Boolean(c),
    };
  });

  const recentVictory = [...data.checkins]
    .reverse()
    .find((c) => c.smallVictory?.trim())
    ?.smallVictory;

  const featured = getFeaturedReading().slice(0, 3);

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
        <div className="hero-panel">
          <BrandLockup size="md" tone="onDark" />
          <p className="mt-5 text-lg leading-relaxed text-white/90">
            Se la mano sta andando automaticamente verso il telefono per cercare materiale sessuale, posa il telefono fuori
            portata e alzati. Non aspettare che l&apos;impulso sparisca.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/stanchezza">
              <Button variant="accent" className="w-full">
                Apri modalità semplice
              </Button>
            </Link>
            <Link href="/frustrazione">
              <Button
                variant="secondary"
                className="w-full border-white/25 bg-white/10 text-white hover:bg-white/18"
              >
                Frustrazione o scoraggiamento
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* First viewport: one composition, brand first */}
      <section className="hero-panel animate-dawn-rise min-h-[58vh] sm:min-h-[52vh]">
        <div className="flex items-start justify-between gap-3">
          <BrandLockup size="lg" tone="onDark" />
          <LogoMark className="hidden h-16 w-16 opacity-90 sm:block" />
        </div>
        <p className="mt-8 text-sm capitalize text-white/70">{formatDisplayDate(date)}</p>
        <h2 className="mt-2 max-w-xl font-[family-name:var(--font-fraunces)] text-3xl leading-tight text-white sm:text-4xl">
          {greetingForHour(hour, data.preferences.displayName)}. Oggi puoi restare desto con calma.
        </h2>
        <p className="mt-3 max-w-lg text-base text-white/80">
          Fermati e prega col cuore. Un impulso è una sensazione, non un comando.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/attivita" className="flex-1">
            <Button
              variant="accent"
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
            <Button
              variant="secondary"
              className="w-full border-white/25 bg-white/10 text-white hover:bg-white/18"
            >
              Registra ieri
            </Button>
          </Link>
        </div>
        <Link href="/frustrazione" className="mt-3 block">
          <Button
            variant="ghost"
            className="w-full border border-white/20 text-white/90 hover:bg-white/10 hover:text-white"
          >
            Mi sento frustrato o scoraggiato
          </Button>
        </Link>
      </section>

      <section className="space-y-5 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="quiet-panel">
          <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Direzione spirituale</p>
          <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl text-brand-deep">
            Amare il bene, odiare il male
          </h3>
          <p className="mt-2 text-sm text-fg-muted">{GUIDE_PHRASES.loveGoodHateEvil}</p>
          <p className="mt-2 text-sm text-fg-muted">{GUIDE_PHRASES.renewMind}</p>
          <p className="mt-2 text-sm text-fg-muted">{GUIDE_PHRASES.marriagePatience}</p>
          <p className="mt-2 text-sm text-fg-muted">{GUIDE_PHRASES.patienceFocus}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <ScriptureLink reference="Romani 12:2" size="sm" />
            <ScriptureLink reference="Romani 12:9" size="sm" />
          </div>
          <div className="mt-4 grid gap-2">
            {featured.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-line bg-bg-elevated/70 px-4 py-3 text-sm transition hover:border-brand/40"
              >
                <span className="font-semibold text-brand-deep">{s.title}</span>
                <span className="mt-1 block text-xs text-fg-muted line-clamp-2">{s.description}</span>
              </a>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/spiritualita">
              <Button variant="secondary" className="w-full">
                Percorso spirituale
              </Button>
            </Link>
            <Link href="/fonti">
              <Button variant="secondary" className="w-full">
                Pubblicazioni JW.org
              </Button>
            </Link>
          </div>
        </div>

        <div className="quiet-panel">
          <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Versetto del giorno</p>
          <div className="mt-2">
            <ScriptureLink reference={verse.reference} size="lg" />
          </div>
          <p className="mt-2 text-sm text-fg-muted">{verse.note}</p>
          <p className="mt-2 text-xs text-fg-muted">Tocca il versetto per aprirlo in JW Library.</p>
        </div>

        <div className="quiet-panel">
          <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Obiettivo quotidiano</p>
          <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl text-brand-deep">
            Fermati e prega col cuore
          </h3>
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
        </div>

        <div className="quiet-panel">
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
        </div>

        <div className="quiet-panel">
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
                  className={`mx-auto h-9 w-9 rounded-full border transition ${
                    d.checkIn ? "border-ok bg-brand-soft" : "border-line bg-bg-elevated/70"
                  }`}
                  title={d.date}
                />
                <p className="mt-1 text-[10px] text-fg-muted">{d.date.slice(8)}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-fg-muted">Ultimi 7 giorni: cerchio pieno = check-in registrato.</p>
        </div>

        {recentVictory ? (
          <div className="quiet-panel">
            <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Piccola vittoria recente</p>
            <p className="mt-2 text-fg">{recentVictory}</p>
          </div>
        ) : null}

        {streak > 0 ? (
          <div className="quiet-panel">
            <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Giorni senza episodi</p>
            <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl text-brand-deep">{streak}</p>
            <p className="mt-1 text-sm text-fg-muted">
              Consecutivi nei check-in registrati. Gli impulsi involontari non spezzano questa serie.
            </p>
          </div>
        ) : null}

        {vulnerableHint ? (
          <div className="rounded-[var(--radius)] bg-accent-soft/70 px-4 py-3 text-sm text-[color:var(--brand-deep)]">
            {vulnerableHint}
          </div>
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
          <Link href="/diario" className="sm:col-span-2">
            <Button variant="ghost" className="w-full">
              Storico diario
            </Button>
          </Link>
        </div>

        <p className="pb-2 text-center text-xs text-fg-muted">{GUIDE_PHRASES.disclaimer}</p>
        <p className="sr-only">{GUIDE_PHRASES.impulse}</p>
      </section>
    </div>
  );
}
