"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { GUIDE_PHRASES, VULNERABLE_HOUR_OPTIONS } from "@/data/catalog";
import {
  getNotificationPermission,
  requestNotificationPermission,
  scheduleLocalReminders,
  sendTestNotification,
} from "@/lib/notifications/reminders";

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
  const [perm, setPerm] = useState(() =>
    typeof window === "undefined" ? ("unsupported" as const) : getNotificationPermission(),
  );

  const prefs = data.preferences;

  const toggleVulnerableHour = (id: string) => {
    const next = prefs.vulnerableHours.includes(id)
      ? prefs.vulnerableHours.filter((h) => h !== id)
      : [...prefs.vulnerableHours, id];
    void updatePreferences({ vulnerableHours: next });
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle title="Impostazioni e privacy" subtitle="I dati restano sul dispositivo finché non configuri Supabase." />

      <Card>
        <label className="font-semibold" htmlFor="name">
          Nome o saluto personale
        </label>
        <input
          id="name"
          className="mt-3 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          className="mt-3 w-full"
          onClick={async () => {
            await updatePreferences({ displayName: name, onboardingCompleted: true });
            setMessage("Preferenze salvate.");
          }}
        >
          Salva
        </Button>
      </Card>

      <Card>
        <h3 className="font-semibold">Orari vulnerabili</h3>
        <p className="mt-1 text-sm text-fg-muted">
          Nei momenti selezionati la home ti ricorda di preparare in anticipo telefono e ambiente.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
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
              <span className="font-medium">{opt.label}</span>
              <span className="mt-0.5 block text-xs opacity-80">{opt.hint}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <label className="font-semibold" htmlFor="limits">
          Limiti fisici o condizioni da rispettare
        </label>
        <p className="mt-1 text-sm text-fg-muted">
          Es. non posso fare passeggiate lunghe, evito piegamenti. L&apos;attività di oggi te lo ricorderà.
        </p>
        <textarea
          id="limits"
          className="mt-3 min-h-20 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={limitations}
          onChange={(e) => setLimitations(e.target.value)}
          placeholder="Facoltativo"
        />
        <Button
          className="mt-3 w-full"
          variant="secondary"
          onClick={async () => {
            await updatePreferences({ physicalLimitations: limitations.trim() });
            setMessage("Limiti salvati.");
          }}
        >
          Salva limiti
        </Button>
      </Card>

      <Card>
        <h3 className="font-semibold">Tema</h3>
        <div className="mt-3 flex flex-wrap gap-2">
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
      </Card>

      <Card>
        <h3 className="font-semibold">Modalità «Sono stanco o poco lucido»</h3>
        <Button
          className="mt-3 w-full"
          variant={prefs.tiredMode ? "accent" : "secondary"}
          onClick={() => void updatePreferences({ tiredMode: !prefs.tiredMode })}
        >
          {prefs.tiredMode ? "Disattiva" : "Attiva"}
        </Button>
        <Link href="/stanchezza" className="mt-3 block text-sm text-brand underline">
          Apri schermata semplificata
        </Link>
        <Link href="/frustrazione" className="mt-2 block text-sm text-brand underline">
          Aiuto per frustrazione / scoraggiamento
        </Link>
      </Card>

      <Card>
        <h3 className="font-semibold">Definizione di ricaduta</h3>
        <p className="mt-1 text-sm text-fg-muted">Gli impulsi involontari restano esclusi per impostazione.</p>
        <div className="mt-3 space-y-2 text-sm">
          {(
            [
              ["countPornography", "Conta episodi di pornografia"],
              ["countMasturbation", "Conta episodi di masturbazione"],
              ["countInvoluntaryImpulse", "Conta impulsi involontari (sconsigliato)"],
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
      </Card>

      <Card>
        <h3 className="font-semibold">Piani se-allora</h3>
        <input
          className="mt-3 w-full rounded-2xl border border-line bg-bg px-4 py-3"
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
          className="mt-3 w-full"
          variant="secondary"
          onClick={async () => {
            await upsertIfThenPlan({ ifCondition, thenAction, active: true });
            setMessage("Piano se-allora salvato.");
          }}
        >
          Salva piano
        </Button>
        <ul className="mt-4 space-y-2 text-sm text-fg-muted">
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
      </Card>

      <Card>
        <h3 className="font-semibold">Strategie personali</h3>
        <p className="mt-1 text-sm text-fg-muted">
          Appariranno insieme alle strategie predefinite nel check-in.
        </p>
        <input
          className="mt-3 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={strategyName}
          onChange={(e) => setStrategyName(e.target.value)}
          placeholder="Nome strategia"
        />
        <input
          className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={strategyDesc}
          onChange={(e) => setStrategyDesc(e.target.value)}
          placeholder="Breve descrizione (facoltativa)"
        />
        <Button
          className="mt-3 w-full"
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
            setMessage("Strategia personale salvata.");
          }}
        >
          Aggiungi strategia
        </Button>
        <ul className="mt-4 space-y-2 text-sm text-fg-muted">
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
      </Card>

      <Card>
        <h3 className="font-semibold">Promemoria</h3>
        <p className="mt-1 text-sm text-fg-muted">
          Testi discreti, senza dettagli sensibili. Su telefono: installa l&apos;app sulla schermata Home e concedi il
          permesso notifiche. I promemoria partono in modo affidabile mentre l&apos;app è aperta o in memoria; se era
          chiusa, al prossimo apertura ricevi quelli scaduti (catch-up).
        </p>
        <p className="mt-2 text-xs text-fg-muted">
          Stato permesso:{" "}
          {perm === "granted"
            ? "concesso"
            : perm === "denied"
              ? "negato (controlla le impostazioni del browser/sistema)"
              : perm === "unsupported"
                ? "non supportato su questo browser"
                : "non ancora chiesto"}
        </p>
        <div className="mt-3 space-y-3 text-sm">
          {(
            [
              ["dailyActivity", "Attività quotidiana"],
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
          variant="secondary"
          onClick={async () => {
            const permission = await requestNotificationPermission();
            setPerm(permission);
            if (permission === "unsupported") {
              setNotifMsg("Questo browser non supporta le notifiche.");
              return;
            }
            if (permission !== "granted") {
              setNotifMsg(
                "Permesso notifiche non concesso. Su iPhone: Impostazioni → Safari/app → Notifiche. Su Android: icona lucchetto del sito → Notifiche.",
              );
              return;
            }
            const scheduled = await scheduleLocalReminders(prefs.notificationSettings);
            setNotifMsg(
              scheduled
                ? "Promemoria attivati. Riceverai una notifica all'orario scelto se l'app è aperta o in memoria; altrimenti al prossimo avvio."
                : "Impossibile programmare i promemoria in questo ambiente.",
            );
          }}
        >
          Attiva / aggiorna promemoria
        </Button>
        <Button
          className="mt-2 w-full"
          variant="ghost"
          onClick={async () => {
            const result = await sendTestNotification();
            setPerm(getNotificationPermission());
            if (result === "ok") setNotifMsg("Notifica di prova inviata. Controlla il centro notifiche.");
            else if (result === "denied")
              setNotifMsg("Permesso negato: abilita le notifiche per questo sito nelle impostazioni del sistema.");
            else if (result === "unsupported") setNotifMsg("Notifiche non supportate su questo browser.");
            else setNotifMsg("Invio della notifica di prova non riuscito.");
          }}
        >
          Invia notifica di prova
        </Button>
        {notifMsg ? <p className="mt-2 text-sm text-fg-muted">{notifMsg}</p> : null}
      </Card>

      <Card>
        <h3 className="font-semibold">Generazione AI (opzionale)</h3>
        <p className="mt-1 text-sm text-fg-muted">
          Disattivata di default. Se abilitata, i dati personale vengono inviati solo con il tuo consenso esplicito.
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.aiConsent}
            onChange={(e) => void updatePreferences({ aiConsent: e.target.checked, aiEnabled: e.target.checked })}
          />
          Acconsento all&apos;invio di dati di contesto (non dettagli espliciti) a un provider AI server-side
        </label>
      </Card>

      <Card>
        <h3 className="font-semibold">Esporta / importa / cancella</h3>
        <div className="mt-3 grid gap-2">
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
              setMessage("Esportazione scaricata.");
            }}
          >
            Esporta i miei dati
          </Button>
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-line px-5 py-3 font-semibold">
            Importa backup
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                await importData(text);
                setMessage("Backup importato.");
              }}
            />
          </label>
          <Button
            variant="ghost"
            onClick={async () => {
              if (confirm("Cancellare definitivamente tutto il diario locale?")) {
                await wipeData();
                setMessage("Diario cancellato.");
              }
            }}
          >
            Cancella definitivamente il diario
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/report">
          <Button variant="secondary" className="w-full">
            Report
          </Button>
        </Link>
        <Link href="/fonti">
          <Button variant="secondary" className="w-full">
            Fonti
          </Button>
        </Link>
        <Link href="/diario">
          <Button variant="secondary" className="w-full">
            Diario
          </Button>
        </Link>
        <Link href="/stanchezza">
          <Button variant="secondary" className="w-full">
            Modalità stanchezza
          </Button>
        </Link>
      </div>

      <Card>
        <p className="text-xs text-fg-muted">{GUIDE_PHRASES.disclaimer}</p>
        <p className="mt-2 text-xs text-fg-muted">
          Informativa: l&apos;app memorizza preferenze, attività, check-in, preghiere e piani sul tuo dispositivo
          (IndexedDB). Nessuna condivisione automatica con terzi. Nessun tracciamento pubblicitario. Con Supabase, i dati
          restano protetti da Row Level Security per utente.
        </p>
      </Card>

      {message ? <p className="text-center text-sm text-ok">{message}</p> : null}
    </div>
  );
}
