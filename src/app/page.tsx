"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp, useYesterdayCheckinNeeded } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { BrandLockup } from "@/components/brand/Logo";
import { ScriptureLink } from "@/components/bible/ScriptureLink";
import { ACTIVITY_CATEGORY_LABELS } from "@/lib/types";
import { formatDisplayDate, greetingForHour, lastNDates, todayIso } from "@/lib/utils/date";
import { pickVerseForDate } from "@/data/verses";
import { GUIDE_PHRASES } from "@/data/catalog";
import { streakWithoutEpisodes } from "@/lib/utils/labels";
import {
  getOverdueReminderJobs,
  markReminderHandled,
} from "@/lib/notifications/reminders";

export default function DashboardPage() {
  const { ready, data, ensureTodayActivity, getActivityForDate, getPrayerForDate, getCheckinForDate } = useApp();
  const { needed, yesterday } = useYesterdayCheckinNeeded();
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [dismissedOverdue, setDismissedOverdue] = useState<string[]>([]);
  const date = todayIso();
  const verse = useMemo(() => pickVerseForDate(date), [date]);
  const activity = getActivityForDate(date);
  const prayer = getPrayerForDate(date);
  const hour = new Date().getHours();
  const streak = useMemo(
    () => streakWithoutEpisodes(data.checkins, data.preferences.relapseDefinition),
    [data.checkins, data.preferences.relapseDefinition],
  );
  const overdue = useMemo(
    () =>
      getOverdueReminderJobs(data.preferences.notificationSettings).filter(
        (j) => !dismissedOverdue.includes(j.id),
      ),
    [data.preferences.notificationSettings, dismissedOverdue],
  );

  useEffect(() => {
    if (!ready) return;
    void ensureTodayActivity();
  }, [ready, ensureTodayActivity]);

  const week = lastNDates(7);
  const weekDone = week.filter((d) => Boolean(getCheckinForDate(d))).length;

  const primary = (() => {
    if (needed) {
      return {
        href: `/check-in?date=${yesterday}`,
        label: "Registra ieri",
        hint: "Manca il check-in di ieri · 1-2 minuti",
      };
    }
    if (!activity?.completedAt) {
      return {
        href: "/attivita",
        label: "Inizia attività",
        hint: activity
          ? `${ACTIVITY_CATEGORY_LABELS[activity.category]} · circa ${activity.durationMinutes} min`
          : "Attività spirituale di oggi",
      };
    }
    if (!prayer?.completed) {
      return {
        href: "/preghiera",
        label: "Momento di preghiera",
        hint: "Fermati e prega col cuore",
      };
    }
    return {
      href: "/attivita",
      label: "Rivedi la giornata",
      hint: "Attività e preghiera già registrate",
    };
  })();

  if (!ready) {
    return <p className="text-fg-muted">Caricamento…</p>;
  }

  if (data.preferences.tiredMode) {
    return (
      <div className="space-y-4 animate-fade-up">
        <div className="hero-panel">
          <BrandLockup size="md" tone="onDark" />
          <p className="mt-5 text-lg leading-relaxed text-white/90">
            Se la mano sta andando verso il telefono per cercare materiale sessuale, posalo fuori portata e alzati.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/stanchezza">
              <Button variant="accent" className="w-full">
                Apri aiuto immediato
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
    <div className="space-y-6">
      <section className="hero-panel animate-dawn-rise min-h-[48vh] sm:min-h-[42vh]">
        <BrandLockup size="lg" tone="onDark" />
        <p className="mt-6 text-sm capitalize text-white/70">{formatDisplayDate(date)}</p>
        <h2 className="mt-2 max-w-xl font-[family-name:var(--font-fraunces)] text-3xl leading-tight text-white sm:text-4xl">
          {greetingForHour(hour, data.preferences.displayName)}
        </h2>
        <p className="mt-3 max-w-lg text-base text-white/80">{primary.hint}</p>
        <div className="mt-8">
          <Link
            href={primary.href}
            className="block"
            onClick={() => {
              if (primary.href === "/attivita") {
                setLoadingActivity(true);
                void ensureTodayActivity().finally(() => setLoadingActivity(false));
              }
            }}
          >
            <Button variant="accent" className="w-full" disabled={loadingActivity}>
              {primary.label}
            </Button>
          </Link>
        </div>
      </section>

      {overdue.length > 0 ? (
        <section className="space-y-2 animate-fade-up">
          {overdue.map((job) => (
            <div key={job.id} className="quiet-panel border border-accent/40 bg-accent-soft/50">
              <p className="text-sm text-fg">{job.body}</p>
              <Link
                href={job.url}
                className="mt-3 inline-block"
                onClick={() => {
                  markReminderHandled(job.id);
                  setDismissedOverdue((ids) => [...ids, job.id]);
                }}
              >
                <Button variant="secondary" className="w-full sm:w-auto">
                  Apri
                </Button>
              </Link>
            </div>
          ))}
        </section>
      ) : null}

      <section className="quiet-panel animate-fade-up" style={{ animationDelay: "60ms" }}>
        <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Oggi</p>
        <ul className="mt-3 space-y-3 text-sm">
          <li className="flex items-center justify-between gap-3">
            <span>Attività</span>
            <span className={activity?.completedAt ? "text-ok" : "text-fg-muted"}>
              {activity?.completedAt ? "Fatta" : "Da fare"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span>Preghiera</span>
            <span className={prayer?.completed ? "text-ok" : "text-fg-muted"}>
              {prayer?.completed ? "Registrata" : "Da fare"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span>Check-in di ieri</span>
            <span className={!needed ? "text-ok" : "text-fg-muted"}>{needed ? "Manca" : "Ok"}</span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-fg-muted">
          Ultimi 7 giorni: {weekDone}/7 check-in
          {streak > 0 ? ` · ${streak} giorni senza episodi` : ""}
        </p>
      </section>

      <section className="quiet-panel animate-fade-up" style={{ animationDelay: "100ms" }}>
        <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Versetto</p>
        <div className="mt-2">
          <ScriptureLink reference={verse.reference} size="lg" />
        </div>
        <p className="mt-2 text-sm text-fg-muted">{verse.note}</p>
      </section>

      {data.preferences.vulnerableHours.length > 0 ? (
        <p className="rounded-[var(--radius)] bg-accent-soft/70 px-4 py-3 text-sm text-[color:var(--brand-deep)]">
          Nei momenti {data.preferences.vulnerableHours.join(", ")} prepara in anticipo telefono e ambiente.
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <Link href="/spiritualita">
          <Button variant="secondary" className="w-full">
            Percorso spirituale
          </Button>
        </Link>
        <Link href="/report">
          <Button variant="secondary" className="w-full">
            Report
          </Button>
        </Link>
      </div>

      <p className="pb-2 text-center text-xs text-fg-muted">{GUIDE_PHRASES.disclaimer}</p>
    </div>
  );
}
