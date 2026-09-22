"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { BrandLockup } from "@/components/brand/Logo";
import { GUIDE_PHRASES, VULNERABLE_HOUR_OPTIONS } from "@/data/catalog";

export function Onboarding() {
  const { ready, data, updatePreferences } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [hours, setHours] = useState<string[]>([]);

  if (!ready || data.preferences.onboardingCompleted) return null;

  const toggleHour = (id: string) => {
    setHours((prev) => (prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]));
  };

  const finish = async () => {
    await updatePreferences({
      displayName: name.trim() || data.preferences.displayName,
      vulnerableHours: hours,
      onboardingCompleted: true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[color-mix(in_oklab,var(--brand-deep)_55%,transparent)] p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[1.35rem] border border-line bg-bg-elevated p-5 shadow-[var(--shadow)] animate-fade-up">
        <BrandLockup size="sm" />

        {step === 0 ? (
          <>
            <h2 id="onboarding-title" className="mt-5 font-[family-name:var(--font-fraunces)] text-2xl text-brand-deep">
              Benvenuto
            </h2>
            <p className="mt-2 text-sm text-fg-muted">
              Questo è un diario personale per restare desto: attività, check-in, preghiera e fonti spirituali. I dati
              restano sul tuo dispositivo.
            </p>
            <p className="mt-3 text-sm text-brand">{GUIDE_PHRASES.impulse}</p>
            <label className="mt-5 block text-sm font-semibold" htmlFor="onb-name">
              Come vuoi essere salutato? (facoltativo)
            </label>
            <input
              id="onb-name"
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. fratello, o il tuo nome"
              autoComplete="nickname"
            />
            <Button className="mt-5 w-full" onClick={() => setStep(1)}>
              Continua
            </Button>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <h2 id="onboarding-title" className="mt-5 font-[family-name:var(--font-fraunces)] text-2xl text-brand-deep">
              Orari più vulnerabili
            </h2>
            <p className="mt-2 text-sm text-fg-muted">
              Nei momenti in cui sei meno lucido, prepara in anticipo telefono e ambiente. Puoi cambiare dopo nelle
              impostazioni.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {VULNERABLE_HOUR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleHour(opt.id)}
                  className={`rounded-2xl border px-3 py-2 text-left text-sm ${
                    hours.includes(opt.id) ? "border-brand bg-brand-soft text-brand" : "border-line"
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-fg-muted">{opt.hint}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              <Button className="w-full" onClick={() => setStep(2)}>
                Continua
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>
                Salta per ora
              </Button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2 id="onboarding-title" className="mt-5 font-[family-name:var(--font-fraunces)] text-2xl text-brand-deep">
              Due cose da ricordare
            </h2>
            <ul className="mt-3 space-y-3 text-sm text-fg-muted">
              <li>{GUIDE_PHRASES.loveGoodHateEvil}</li>
              <li>{GUIDE_PHRASES.patienceFocus}</li>
            </ul>
            <p className="mt-4 text-xs text-fg-muted">{GUIDE_PHRASES.disclaimer}</p>
            <Button className="mt-5 w-full" onClick={() => void finish()}>
              Inizia
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
