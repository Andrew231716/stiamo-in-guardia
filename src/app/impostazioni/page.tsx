"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { GUIDE_PHRASES, VULNERABLE_HOUR_OPTIONS } from "@/data/catalog";
import {
  getNotificationPermission,
  scheduleLocalReminders,
  sendTestNotification,
} from "@/lib/notifications/reminders";
import {
  disableWebPush,
  enableWebPush,
  isPushSupported,
  sendPushTestNotification,
  werePushRemindersArmed,
} from "@/lib/push/client";

export default function ImpostazioniPage() {
  const { ready, data } = useApp();

  if (!ready) return <p className="text-fg-muted">Caricamento…</p>;

  return (
    <ImpostazioniForm key={data.preferences.displayName || "anon"} initialName={data.preferences.displayName} />
  );
}

function ImpostazioniForm({ initialName }: { initialName: string }) {
  const {
    data,
    updatePreferences,
    exportData,
    importData,
    wipeData,
    upsertIfThenPlan,
    deleteIfThenPlan,
    upsertCustomStrategy,
    deleteCustomStrategy,
  } = useApp();
  const [name, setName] = useState(initialName);
  const [ifCondition, setIfCondition] = useState("noto che sto prendendo il telefono per una ricerca");
  const [thenAction, setThenAction] = useState("lo poso fuori portata e mi alzo");
  const [strategyName, setStrategyName] = useState("");
  const [strategyDesc, setStrategyDesc] = useState("");
  const [limitations, setLimitations] = useState(data.preferences.physicalLimitations);
  const [message, setMessage] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [pushBusy, setPushBusy] = useState(false);
  const [pushArmed, setPushArmed] = useState(() =>
    typeof window === "undefined" ? false : werePushRemindersArmed(),
  );
  const [perm, setPerm] = useState(() =>
    typeof window === "undefined" ? ("unsupported" as const) : getNotificationPermission(),
  );
  const pushOk = typeof window !== "undefined" && isPushSupported();
  const prefs = data.preferences;

  const toggleVulnerableHour = (id: string) => {
    const next = prefs.vulnerableHours.includes(id)
      ? prefs.vulnerableHours.filter((h) => h !== id)
      : [...prefs.vulnerableHours, id];
    void updatePreferences({ vulnerableHours: next });
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle title="Altro" subtitle="Scorciatoie, promemoria e preferenze." />

      <div className="grid gap-2 sm:grid-cols-2">
        {[
          ["/stanchezza", "Aiuto ora"],
          ["/frustrazione", "Frustrazione"],
          ["/spiritualita", "Percorso spirituale"],
          ["/fonti", "Fonti JW.org"],
          ["/diario", "Diario"],
          ["/report", "Report"],
        ].map(([href, label]) => (
          <Link key={href} href={href}>
            <Button variant="secondary" className="w-full">
              {label}
            </Button>
          </Link>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold">Modalità semplice</h3>
        <p className="mt-1 text-sm text-fg-muted">Pochi passi quando sei poco lucido.</p>
        <Button
          className="mt-3 w-full"
          variant={prefs.tiredMode ? "accent" : "secondary"}
          onClick={() => void updatePreferences({ tiredMode: !prefs.tiredMode })}
        >
          {prefs.tiredMode ? "Disattiva" : "Attiva"}
        </Button>
      </Card>

      <Card>
        <h3 className="font-semibold">Promemoria</h3>
        <p className="mt-1 text-sm text-fg-muted">
          Installa l&apos;app sulla Home, aprila dall&apos;icona, poi attiva i promemoria.
        </p>
        <p className="mt-2 text-xs text-fg-muted">
          Permesso:{" "}
          {perm === "granted" ? "ok" : perm === "denied" ? "negato" : perm === "unsupported" ? "non supportato" : "da chiedere"}
          {" · "}
          Push: {pushArmed ? "attivi" : pushOk ? "da attivare" : "non supportati"}
        </p>
        <div className="mt-3 space-y-2 text-sm">
          {(
            [
              ["dailyActivity", "Attività"],
              ["checkIn", "Check-in"],
              ["prayer", "Preghiera"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={prefs.notificationSettings[key].enabled}
                  onChange={(e) =>
                    void updatePreferences({
                      notificationSettings: {
                        ...prefs.notificationSettings,
                        [key]: { ...prefs.notificationSettings[key], enabled: e.target.checked },
                      },
                    })
                  }
                />
                {label}
              </label>
              <input
                type="time"
                value={prefs.notificationSettings[key].time}
                onChange={(e) =>
                  void updatePreferences({
                    notificationSettings: {
                      ...prefs.notificationSettings,
                      [key]: { ...prefs.notificationSettings[key], time: e.target.value },
                    },
                  })
                }
                className="rounded-lg border border-line bg-bg px-2 py-1"
              />
            </div>
          ))}
        </div>
        <Button
          className="mt-3 w-full"
          disabled={pushBusy}
          onClick={async () => {
            setPushBusy(true);
            try {
              const result = await enableWebPush(prefs.notificationSettings);
              setPerm(getNotificationPermission());
              if (!result.ok) {
                setPushArmed(false);
                if (result.reason === "unsupported") {
                  setNotifMsg("Push non supportato. Usa l'app dalla Home.");
                } else if (result.reason === "denied") {
                  setNotifMsg("Permesso notifiche negato.");
                } else {
                  setNotifMsg("Attivazione non riuscita. Riprova dall'icona Home.");
                }
                return;
              }
              await scheduleLocalReminders(prefs.notificationSettings);
              setPushArmed(true);
              setNotifMsg("Promemoria attivati anche a app chiusa.");
            } finally {
              setPushBusy(false);
            }
          }}
        >
          {pushBusy ? "Attivazione…" : "Attiva promemoria"}
        </Button>
        <Button
          className="mt-2 w-full"
          variant="secondary"
          disabled={pushBusy}
          onClick={async () => {
            setPushBusy(true);
            try {
              const result = await sendPushTestNotification(prefs.notificationSettings);
              setPerm(getNotificationPermission());
              setPushArmed(werePushRemindersArmed());
              if (result === "ok") setNotifMsg("Push di prova inviata.");
              else if (result === "denied") setNotifMsg("Permesso negato.");
              else if (result === "unsupported") setNotifMsg("Push non supportato.");
              else setNotifMsg("Prova non riuscita: attiva prima i promemoria.");
            } finally {
              setPushBusy(false);
            }
          }}
        >
          Prova push
        </Button>
        <Button
          className="mt-2 w-full"
          variant="ghost"
          disabled={pushBusy}
          onClick={async () => {
            const local = await sendTestNotification();
            setPerm(getNotificationPermission());
            if (local === "ok") setNotifMsg("Notifica locale inviata.");
            else setNotifMsg("Notifica locale non riuscita.");
          }}
        >
          Prova locale
        </Button>
        {pushArmed ? (
          <Button
            className="mt-2 w-full"
            variant="ghost"
            disabled={pushBusy}
            onClick={async () => {
              setPushBusy(true);
              try {
                await disableWebPush();
                setPushArmed(false);
                setNotifMsg("Push disattivati.");
              } finally {
                setPushBusy(false);
              }
            }}
          >
            Disattiva push
          </Button>
        ) : null}
        {notifMsg ? <p className="mt-2 text-sm text-fg-muted">{notifMsg}</p> : null}
      </Card>

      <Card>
        <label className="font-semibold" htmlFor="name">
          Nome o saluto
        </label>
        <input
          id="name"
          className="mt-3 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          className="mt-3 w-full"
          variant="secondary"
          onClick={async () => {
            await updatePreferences({ displayName: name, onboardingCompleted: true });
            setMessage("Salvato.");
          }}
        >
          Salva
        </Button>
      </Card>

      <details className="rounded-[var(--radius)] border border-line bg-bg-elevated/70 px-4 py-3">
        <summary className="cursor-pointer font-semibold">Preferenze avanzate</summary>
        <div className="mt-4 space-y-5">
          <div>
            <h3 className="font-semibold">Orari vulnerabili</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {VULNERABLE_HOUR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleVulnerableHour(opt.id)}
                  className={`rounded-2xl border px-3 py-2 text-left text-sm ${
                    prefs.vulnerableHours.includes(opt.id)
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-line"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold" htmlFor="limits">
              Limiti fisici
            </label>
            <textarea
              id="limits"
              className="mt-2 min-h-20 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="Facoltativo"
            />
            <Button
              className="mt-2 w-full"
              variant="secondary"
              onClick={async () => {
                await updatePreferences({ physicalLimitations: limitations.trim() });
                setMessage("Limiti salvati.");
              }}
            >
              Salva limiti
            </Button>
          </div>

          <div>
            <h3 className="font-semibold">Tema</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["light", "dark", "system"] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={`rounded-full border px-3 py-2 text-sm ${
                    prefs.theme === theme ? "border-brand bg-brand-soft text-brand" : "border-line"
                  }`}
                  onClick={() => void updatePreferences({ theme })}
                >
                  {theme === "light" ? "Chiaro" : theme === "dark" ? "Scuro" : "Sistema"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Definizione di ricaduta</h3>
            <div className="mt-2 space-y-2 text-sm">
              {(
                [
                  ["countPornography", "Conta pornografia"],
                  ["countMasturbation", "Conta masturbazione"],
                  ["countInvoluntaryImpulse", "Conta impulsi involontari"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={prefs.relapseDefinition[key]}
                    onChange={(e) =>
                      void updatePreferences({
                        relapseDefinition: { ...prefs.relapseDefinition, [key]: e.target.checked },
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Piani se-allora</h3>
            <input
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={ifCondition}
              onChange={(e) => setIfCondition(e.target.value)}
              placeholder="Se…"
            />
            <input
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={thenAction}
              onChange={(e) => setThenAction(e.target.value)}
              placeholder="allora…"
            />
            <Button
              className="mt-2 w-full"
              variant="secondary"
              onClick={async () => {
                await upsertIfThenPlan({ ifCondition, thenAction, active: true });
                setMessage("Piano salvato.");
              }}
            >
              Salva piano
            </Button>
            <ul className="mt-3 space-y-2 text-sm text-fg-muted">
              {data.ifThenPlans.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3 rounded-xl border border-line p-3">
                  <span>
                    Se {p.ifCondition}, allora {p.thenAction}
                  </span>
                  <button type="button" className="text-brand" onClick={() => void deleteIfThenPlan(p.id)}>
                    Elimina
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Strategie personali</h3>
            <input
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              placeholder="Nome"
            />
            <input
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3"
              value={strategyDesc}
              onChange={(e) => setStrategyDesc(e.target.value)}
              placeholder="Descrizione (facoltativa)"
            />
            <Button
              className="mt-2 w-full"
              variant="secondary"
              onClick={async () => {
                if (!strategyName.trim()) return;
                await upsertCustomStrategy({
                  name: strategyName.trim(),
                  description: strategyDesc.trim() || "Strategia personale",
                  category: "custom",
                });
                setStrategyName("");
                setStrategyDesc("");
                setMessage("Strategia salvata.");
              }}
            >
              Aggiungi
            </Button>
            <ul className="mt-3 space-y-2 text-sm text-fg-muted">
              {data.customStrategies.map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-3 rounded-xl border border-line p-3">
                  <span>
                    <strong className="text-fg">{s.name}</strong>
                    {s.description ? ` — ${s.description}` : ""}
                  </span>
                  <button type="button" className="text-brand" onClick={() => void deleteCustomStrategy(s.id)}>
                    Elimina
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Coach AI</h3>
            <p className="mt-1 text-sm text-fg-muted">
              Analisi locale sempre disponibile. Cloud opzionale con consenso.
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={prefs.aiConsent}
                onChange={(e) =>
                  void updatePreferences({ aiConsent: e.target.checked, aiEnabled: e.target.checked })
                }
              />
              Consento analisi cloud (senza dettagli espliciti)
            </label>
          </div>

          <div>
            <h3 className="font-semibold">Dati</h3>
            <div className="mt-2 grid gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  const json = await exportData();
                  const blob = new Blob([json], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `stiamo-in-guardia-backup-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setMessage("Backup scaricato.");
                }}
              >
                Esporta
              </Button>
              <label className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-line px-5 py-3 font-semibold">
                Importa
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await importData(await file.text());
                    setMessage("Backup importato.");
                  }}
                />
              </label>
              <Button
                variant="ghost"
                onClick={async () => {
                  if (confirm("Cancellare tutto il diario locale?")) {
                    await wipeData();
                    setMessage("Diario cancellato.");
                  }
                }}
              >
                Cancella diario
              </Button>
            </div>
          </div>
        </div>
      </details>

      <Card>
        <p className="text-xs text-fg-muted">{GUIDE_PHRASES.disclaimer}</p>
        <p className="mt-2 text-xs text-fg-muted">
          I dati restano sul dispositivo (IndexedDB). Nessun tracking pubblicitario.
        </p>
      </Card>

      {message ? <p className="text-center text-sm text-ok">{message}</p> : null}
    </div>
  );
}
