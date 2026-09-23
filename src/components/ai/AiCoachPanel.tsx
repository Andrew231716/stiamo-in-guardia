"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  buildLocalActivityCoach,
  buildLocalCheckinCoach,
} from "@/lib/ai/localCoach";
import type { ActivityCoachInput, AiCoachResult, CheckinCoachInput } from "@/lib/ai/types";

type Input = CheckinCoachInput | ActivityCoachInput;

export function AiCoachPanel({ input }: { input: Input }) {
  const { data } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiCoachResult | null>(null);
  const [error, setError] = useState("");

  const consent = data.preferences.aiConsent;

  const runLocal = () => {
    setError("");
    const local =
      input.kind === "checkin" ? buildLocalCheckinCoach(input) : buildLocalActivityCoach(input);
    setResult(local);
  };

  const runCloud = async () => {
    setLoading(true);
    setError("");
    try {
      if (!consent) {
        setError("Per l'analisi cloud abilita il consenso AI in Impostazioni → Generazione AI.");
        runLocal();
        return;
      }
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true, preferCloud: true, input }),
      });
      const payload = (await res.json()) as { result?: AiCoachResult; error?: string };
      if (!res.ok || !payload.result) {
        setError(payload.error ?? "Analisi non riuscita. Uso quella locale.");
        runLocal();
        return;
      }
      setResult(payload.result);
    } catch {
      setError("Connessione non disponibile. Uso l'analisi locale.");
      runLocal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-brand/20 bg-brand-soft/15">
      <p className="text-xs uppercase tracking-[0.16em] text-fg-muted">Coach AI</p>
      <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-xl text-brand-deep">
        Analizza le mie risposte
      </h3>
      <p className="mt-2 text-sm text-fg-muted">
        Ti indica cosa avresti potuto fare e cosa cambiare, basandosi su JW.org / WOL e siti ufficiali di
        psicologia/salute. L&apos;analisi locale è gratuita e resta sul dispositivo; quella cloud usa un provider
        gratuito (es. Groq) solo con il tuo consenso.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button variant="secondary" className="w-full" disabled={loading} onClick={runLocal}>
          Analisi locale (gratis)
        </Button>
        <Button className="w-full" disabled={loading} onClick={() => void runCloud()}>
          {loading ? "Analisi in corso…" : "Analisi AI (locale o cloud)"}
        </Button>
      </div>

      {!consent ? (
        <p className="mt-2 text-xs text-fg-muted">
          Consenso cloud non attivo: l&apos;analisi AI userà comunque il motore locale, oppure abilitalo in
          Impostazioni.
        </p>
      ) : null}

      {error ? <p className="mt-2 text-sm text-warn">{error}</p> : null}

      {result ? (
        <div className="mt-5 space-y-4 animate-fade-up">
          <p className="text-xs text-fg-muted">{result.providerLabel}</p>
          <p className="text-sm leading-relaxed text-fg">{result.summary}</p>

          <div>
            <p className="text-sm font-semibold">Cosa avresti potuto fare</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
              {result.whatCouldHaveDone.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Cosa cambiare</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
              {result.whatToChange.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Prossimi passi</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
              {result.nextSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Fonti ufficiali consigliate</p>
            <ul className="mt-2 space-y-2">
              {result.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-brand underline"
                  >
                    {s.title}
                  </a>
                  <span className="mt-0.5 block text-xs text-fg-muted">
                    {s.organization} · {s.sourceType === "spiritual" ? "spirituale" : "clinico / psicologia"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-fg-muted">{result.disclaimer}</p>
        </div>
      ) : null}
    </Card>
  );
}
