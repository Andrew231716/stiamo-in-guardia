"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { CheckinInsight } from "@/lib/reports/checkinInsight";
import { GUIDE_PHRASES } from "@/data/catalog";

const toneBorder: Record<CheckinInsight["tone"], string> = {
  victory: "border-ok/40 bg-brand-soft/40",
  interrupted: "border-brand/25 bg-brand-soft/25",
  learning: "border-accent/40 bg-accent-soft/40",
  neutral: "border-line",
};

const severityText: Record<CheckinInsight["daySeverity"], string> = {
  none: "text-ok",
  low: "text-brand",
  moderate: "text-warn",
  elevated: "text-[color:var(--danger-soft)]",
};

export function CheckinInsightCard({ insight }: { insight: CheckinInsight }) {
  return (
    <Card className={toneBorder[insight.tone]}>
      <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Dopo il check-in</p>
      <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-xl text-brand-deep">
        {insight.headline}
      </h3>

      <div className="mt-4">
        <p className="text-sm font-semibold">Dove avresti potuto agire</p>
        <p className="mt-1 text-sm text-fg-muted leading-relaxed">{insight.whereToAct}</p>
        {insight.earlierBreakPoints.length > 0 && insight.tone === "learning" ? (
          <p className="mt-2 text-xs text-fg-muted">
            Punti precedenti nella sequenza: {insight.earlierBreakPoints.join(" → ")}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold">Cosa avresti potuto fare / fare ora</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-fg-muted">
          {insight.suggestedActions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-bg/60 px-4 py-3">
        <p className={`text-sm font-semibold ${severityText[insight.daySeverity]}`}>
          {insight.daySeverityLabel}
        </p>
        <p className="mt-1 text-sm text-fg-muted">{insight.daySeverityNote}</p>
      </div>

      <p className="mt-4 text-sm text-brand">{insight.encouragement}</p>
      <p className="mt-2 text-xs text-fg-muted">{GUIDE_PHRASES.impulse}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link href="/report/mensile">
          <Button variant="secondary" className="w-full">
            Scheda mensile
          </Button>
        </Link>
        <Link href="/frustrazione">
          <Button variant="ghost" className="w-full">
            Aiuto immediato
          </Button>
        </Link>
      </div>
    </Card>
  );
}
