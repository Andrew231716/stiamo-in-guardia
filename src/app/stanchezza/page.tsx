"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { GUIDE_PHRASES } from "@/data/catalog";

export default function StanchezzaPage() {
  const { ready, data, updatePreferences, upsertIfThenPlan } = useApp();
  const plan = data.ifThenPlans.find((p) => p.active) ?? {
    ifCondition: "la mano sta andando automaticamente verso il telefono per cercare materiale sessuale",
    thenAction: "poso il telefono fuori portata e mi alzo",
  };

  if (!ready) return <p className="text-fg-muted">Caricamento…</p>;

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle title="Sono stanco o poco lucido" subtitle="Pochi elementi. Nessuna decisione complicata." />

      <Card>
        <p className="text-lg leading-relaxed">
          Se {plan.ifCondition}, {plan.thenAction}. Non aspettare che l&apos;impulso sparisca.
        </p>
        <p className="mt-4 text-sm text-brand">{GUIDE_PHRASES.impulse}</p>
      </Card>

      <Card>
        <h3 className="font-semibold">Azione immediata</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-fg-muted">
          <li>Ferma.</li>
          <li>Posa il telefono fuori portata.</li>
          <li>Alzati o cambia stanza.</li>
          <li>Se puoi, rivolgiti brevemente a Geova.</li>
        </ol>
        <Button
          className="mt-4 w-full"
          onClick={async () => {
            await upsertIfThenPlan({
              ifCondition: plan.ifCondition,
              thenAction: plan.thenAction,
              active: true,
            });
          }}
        >
          Ho posato il telefono / cambiato ambiente
        </Button>
      </Card>

      <Link href="/frustrazione">
        <Button variant="secondary" className="w-full">
          Se è più frustrazione o scoraggiamento
        </Button>
      </Link>

      <Link href="/check-in">
        <Button variant="secondary" className="w-full">
          Registra il check-in
        </Button>
      </Link>

      <Button
        variant="ghost"
        className="w-full"
        onClick={async () => {
          await updatePreferences({ tiredMode: false });
        }}
      >
        Disattiva modalità semplice
      </Button>
    </div>
  );
}
