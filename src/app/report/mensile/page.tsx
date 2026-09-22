"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/components/providers/AppProvider";
import { Card, SectionTitle } from "@/components/ui/Card";
import { buildReport } from "@/lib/reports/buildReport";
import { monthBounds, formatShortDate } from "@/lib/utils/date";
import { parseISO, startOfWeek, format } from "date-fns";
import { it } from "date-fns/locale";

export default function MonthlyReportPage() {
  const { ready, data } = useApp();
  const bounds = monthBounds();

  const report = useMemo(() => {
    if (!ready) return null;
    const base = buildReport({
      periodType: "monthly",
      startDate: bounds.startDate,
      endDate: bounds.endDate,
      checkins: data.checkins,
      activities: data.activities,
      prayers: data.prayers,
      preferences: data.preferences,
    });

    const weeks = new Map<string, { weekLabel: string; pornography: number; masturbation: number }>();
    for (const c of data.checkins.filter((x) => x.date >= bounds.startDate && x.date <= bounds.endDate)) {
      const weekStart = startOfWeek(parseISO(c.date), { weekStartsOn: 1 });
      const key = format(weekStart, "yyyy-MM-dd");
      const label = format(weekStart, "'Sett.' d MMM", { locale: it });
      const current = weeks.get(key) ?? { weekLabel: label, pornography: 0, masturbation: 0 };
      if (c.pornographyStatus === "episode") current.pornography += 1;
      if (c.masturbationStatus === "episode") current.masturbation += 1;
      weeks.set(key, current);
    }

    return {
      ...base,
      weeklyEpisodeSeries: [...weeks.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, v]) => v),
    };
  }, [ready, data, bounds.startDate, bounds.endDate]);

  if (!ready || !report) return <p className="text-fg-muted">Generazione report…</p>;

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle title="Report mensile" subtitle={`Periodo ${report.startDate} → ${report.endDate}`} />

      {report.insufficientData ? (
        <Card>
          <p className="text-warn">Dati insufficienti</p>
          <p className="mt-2 text-sm text-fg-muted">
            Non mostriamo percentuali fuorvianti. Completa più check-in per un andamento più leggibile.
          </p>
        </Card>
      ) : null}

      <Card>
        <h3 className="font-semibold">Andamento settimanale degli episodi registrati</h3>
        {report.weeklyEpisodeSeries?.length ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.weeklyEpisodeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pornography" name="Pornografia" stroke="var(--brand)" strokeWidth={2} />
                <Line type="monotone" dataKey="masturbation" name="Masturbazione" stroke="var(--accent)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">Dati insufficienti</p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold">Distribuzione dei trigger</h3>
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
        <h3 className="font-semibold">Strategie utilizzate</h3>
        {report.strategiesUsed.length ? (
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.strategiesUsed}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">Dati insufficienti</p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold">Calendario dei check-in</h3>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {report.checkInCalendar?.map((d) => (
            <div key={d.date} className="text-center">
              <div
                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl border text-[10px] ${
                  d.hasCheckIn
                    ? d.hasEpisode
                      ? "border-danger-soft/50 bg-accent-soft text-fg"
                      : "border-ok bg-brand-soft text-brand"
                    : "border-line text-fg-muted"
                }`}
                title={d.date}
              >
                {formatShortDate(d.date).split(" ")[0]}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-fg-muted">
          Verde: check-in senza episodi registrati. Sabbia: check-in con episodio. Vuoto: nessun check-in (non interpretato
          come assenza di episodi).
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-fg-muted">Attività spirituali completate</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">{report.activitiesCompleted}</p>
        </Card>
        <Card>
          <p className="text-sm text-fg-muted">Momenti di preghiera registrati</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">{report.prayerCheckIns}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold">Piccole vittorie significative</h3>
        {report.smallVictories.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
            {report.smallVictories.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">Nessuna annotazione.</p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold">Difficoltà da attenzionare</h3>
        {report.recurringDifficulties.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
            {report.recurringDifficulties.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">Nessuna annotazione.</p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold">Obiettivi per il mese successivo</h3>
        <p className="mt-2 text-fg-muted">{report.nextObjective}</p>
      </Card>
    </div>
  );
}
