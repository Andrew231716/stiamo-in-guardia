"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/components/providers/AppProvider";
import { Card, SectionTitle } from "@/components/ui/Card";
import { buildReport } from "@/lib/reports/buildReport";
import { weekBounds } from "@/lib/utils/date";

export default function WeeklyReportPage() {
  const { ready, data } = useApp();
  const bounds = weekBounds();
  const report = useMemo(() => {
    if (!ready) return null;
    return buildReport({
      periodType: "weekly",
      startDate: bounds.startDate,
      endDate: bounds.endDate,
      checkins: data.checkins,
      activities: data.activities,
      prayers: data.prayers,
      preferences: data.preferences,
    });
  }, [ready, data, bounds.startDate, bounds.endDate]);

  if (!ready || !report) return <p className="text-fg-muted">Generazione report…</p>;

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Report settimanale"
        subtitle={`Periodo ${report.startDate} → ${report.endDate}`}
      />

      {report.insufficientData ? (
        <Card>
          <p className="text-warn">Dati insufficienti</p>
          <p className="mt-2 text-sm text-fg-muted">
            Servono più check-in per un riepilogo affidabile. Un giorno senza registrazione non viene contato come giorno
            senza episodi.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-fg-muted">Check-in completati</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">{report.checkInDays}</p>
        </Card>
        <Card>
          <p className="text-sm text-fg-muted">Attività completate</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">{report.activitiesCompleted}</p>
        </Card>
        <Card>
          <p className="text-sm text-fg-muted">Episodi pornografia registrati</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">{report.pornographyEpisodes}</p>
        </Card>
        <Card>
          <p className="text-sm text-fg-muted">Episodi masturbazione registrati</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">{report.masturbationEpisodes}</p>
        </Card>
      </div>

      <Card>
        <p className="text-sm text-fg-muted">Giorni senza episodi (solo tra i check-in)</p>
        <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">
          {report.daysWithoutEpisodes === null ? "Dati insufficienti" : report.daysWithoutEpisodes}
        </p>
      </Card>

      <Card>
        <h3 className="font-semibold">Trigger più frequenti</h3>
        {report.topTriggers.length ? (
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.topTriggers}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--brand)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">Dati insufficienti</p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold">Momenti di maggiore vulnerabilità</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
          {report.vulnerabilityNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-semibold">Strategie utilizzate</h3>
        {report.strategiesUsed.length ? (
          <ul className="mt-2 space-y-1 text-sm text-fg-muted">
            {report.strategiesUsed.map((s) => (
              <li key={s.name}>
                {s.name}: {s.count}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">Dati insufficienti</p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold">Strategie associate a interruzioni</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Associazione nei tuoi dati, non prova di causalità.
        </p>
        {report.strategiesWithInterruptions.length ? (
          <ul className="mt-2 space-y-1 text-sm text-fg-muted">
            {report.strategiesWithInterruptions.map((s) => (
              <li key={s.name}>
                {s.name}: {s.count}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">Dati insufficienti</p>
        )}
      </Card>

      <Card>
        <p className="text-sm text-fg-muted">Check-in «Fermati e prega col cuore»</p>
        <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">{report.prayerCheckIns}</p>
      </Card>

      <Card>
        <h3 className="font-semibold">Piccole vittorie</h3>
        {report.smallVictories.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
            {report.smallVictories.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">Nessuna vittoria annotata in questo periodo.</p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold">Difficoltà ricorrenti</h3>
        {report.recurringDifficulties.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
            {report.recurringDifficulties.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">Nessuna difficoltà annotata.</p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold">Obiettivo pratico per la settimana successiva</h3>
        <p className="mt-2 text-fg-muted">{report.nextObjective}</p>
      </Card>
    </div>
  );
}
