"use client";

import Link from "next/link";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ReportIndexPage() {
  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Report"
        subtitle="Basati solo sui dati che hai registrato. Nessuna classifica morale."
      />
      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Report settimanale</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Riepilogo dei check-in, trigger, strategie e attività spirituali della settimana.
        </p>
        <Link href="/report/settimanale" className="mt-4 block">
          <Button className="w-full">Apri settimanale</Button>
        </Link>
      </Card>
      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Report mensile</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Andamento, calendario dei check-in e obiettivi per il mese successivo.
        </p>
        <Link href="/report/mensile" className="mt-4 block">
          <Button className="w-full">Apri mensile</Button>
        </Link>
      </Card>
      <Card>
        <Link href="/diario">
          <Button variant="secondary" className="w-full">
            Storico diario
          </Button>
        </Link>
      </Card>
    </div>
  );
}
