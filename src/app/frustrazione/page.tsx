"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ScriptureLink } from "@/components/bible/ScriptureLink";
import { GUIDE_PHRASES } from "@/data/catalog";

export default function FrustrazionePage() {
  const { ready, upsertIfThenPlan } = useApp();

  if (!ready) return <p className="text-fg-muted">Caricamento…</p>;

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Frustrazione e scoraggiamento"
        subtitle="Quando l'attesa o lo sconforto abbassano la guardia — agisci prima che l'impulso prenda il volante."
      />

      <Card className="border-brand/25 bg-brand-soft/35">
        <p className="text-lg leading-relaxed">{GUIDE_PHRASES.frustrationNow}</p>
        <p className="mt-3 text-sm text-fg-muted">{GUIDE_PHRASES.patienceFocus}</p>
        <p className="mt-3 text-sm font-medium text-brand">{GUIDE_PHRASES.marriagePatience}</p>
      </Card>

      <Card>
        <h3 className="font-semibold">Cosa fare adesso (2–5 minuti)</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-fg-muted">
          <li>Riconosci: «Mi sento frustrato / scoraggiato» — non è un comando a cedere.</li>
          <li>Posa il telefono fuori portata o cambia stanza.</li>
          <li>Rivolgiti a Geova con una frase sincera, anche se breve.</li>
          <li>Scegli un&apos;azione buona concreta: leggere un versetto, uscire, un compito utile, chiamare un amico.</li>
          <li>Non restare a fissare il desiderio vuoto: riempi la mente di altro edificante.</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-3">
          <ScriptureLink reference="Filippesi 4:6, 7" size="sm" />
          <ScriptureLink reference="Romani 12:2" size="sm" />
        </div>
        <Button
          className="mt-4 w-full"
          onClick={async () => {
            await upsertIfThenPlan({
              ifCondition: "noto frustrazione o scoraggiamento per l'attesa o la solitudine",
              thenAction: "poso il telefono, prego brevemente e scelgo un'azione buona concreta",
              active: true,
            });
          }}
        >
          Ho interrotto e scelto un&apos;azione buona
        </Button>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/preghiera">
          <Button variant="secondary" className="w-full">
            Apri preghiera
          </Button>
        </Link>
        <Link href="/attivita">
          <Button variant="secondary" className="w-full">
            Attività di oggi
          </Button>
        </Link>
        <Link href="/spiritualita">
          <Button variant="secondary" className="w-full">
            Percorso spirituale
          </Button>
        </Link>
        <Link href="/stanchezza">
          <Button variant="ghost" className="w-full">
            Modalità semplice
          </Button>
        </Link>
      </div>

      <p className="text-center text-xs text-fg-muted">{GUIDE_PHRASES.impulse}</p>
    </div>
  );
}
