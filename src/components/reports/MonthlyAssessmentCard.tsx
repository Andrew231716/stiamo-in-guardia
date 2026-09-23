"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import type { MonthlyHabitAssessment } from "@/lib/reports/monthlyAssessment";

const directionClass: Record<MonthlyHabitAssessment["riskDirection"], string> = {
  improving: "text-ok",
  stable: "text-brand",
  worsening: "text-warn",
  insufficient: "text-fg-muted",
};

export function MonthlyAssessmentCard({ assessment }: { assessment: MonthlyHabitAssessment }) {
  return (
    <div className="space-y-4">
      <Card className="border-brand/20 bg-brand-soft/20">
        <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Scheda valutativa mensile</p>
        <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl text-brand-deep">
          Gravità e rischio di abitudine
        </h3>
        <p className="mt-2 text-sm text-fg-muted">
          Periodo {assessment.startDate} → {assessment.endDate} · basata su {assessment.checkInDays}{" "}
          check-in
          {assessment.previousRiskScore != null
            ? ` · confronto con ${assessment.previousStartDate} → ${assessment.previousEndDate}`
            : ""}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-bg-elevated/80 px-4 py-3">
            <p className="text-xs text-fg-muted">Giorni con episodi</p>
            <p className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl">{assessment.episodeDays}</p>
          </div>
          <div className="rounded-2xl border border-line bg-bg-elevated/80 px-4 py-3">
            <p className="text-xs text-fg-muted">Giorni con vittorie / protezioni</p>
            <p className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl text-ok">
              {assessment.victoryDays}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-bg-elevated/80 px-4 py-3">
            <p className="text-xs text-fg-muted">Indicatore di rischio</p>
            <p className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl">
              {assessment.riskScore == null ? "—" : `${assessment.riskScore}`}
              {assessment.riskScore != null ? (
                <span className="text-base text-fg-muted">/100</span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <p className="font-semibold">{assessment.severityLabel}</p>
            <p className="mt-1 text-sm text-fg-muted leading-relaxed">{assessment.severitySummary}</p>
          </div>
          <div>
            <p className={`font-semibold ${directionClass[assessment.riskDirection]}`}>
              {assessment.riskDirectionLabel}
            </p>
            <p className="mt-1 text-sm text-fg-muted leading-relaxed">{assessment.riskSummary}</p>
          </div>
        </div>

        {!assessment.insufficientData ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {assessment.factorsUp.length ? (
              <div>
                <p className="text-sm font-semibold text-warn">Segnali di avvicinamento</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
                  {assessment.factorsUp.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {assessment.factorsDown.length ? (
              <div>
                <p className="text-sm font-semibold text-ok">Segnali di allontanamento</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
                  {assessment.factorsDown.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {assessment.focusActions.length ? (
          <div className="mt-5">
            <p className="text-sm font-semibold">Focus per il prossimo mese</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
              {assessment.focusActions.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-5 text-xs text-fg-muted">{assessment.disclaimer}</p>
      </Card>

      <Card>
        <h3 className="font-semibold">Ricadute e vittorie nel mese</h3>
        <p className="mt-1 text-sm text-fg-muted">
          Per settimana: ricadute = giorni con episodio; vittorie = giorni con protezioni, interruzione
          precoce, preghiera o piccola vittoria (anche nello stesso giorno di un episodio interrotto).
        </p>
        {assessment.series.length ? (
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assessment.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ricadute" name="Ricadute" fill="var(--danger-soft)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="vittorie" name="Vittorie" fill="var(--ok)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-3 text-sm text-fg-muted">Ancora nessun dato settimanale in questo mese.</p>
        )}
      </Card>
    </div>
  );
}
