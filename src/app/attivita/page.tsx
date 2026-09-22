"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ScriptureList } from "@/components/bible/ScriptureLink";
import type { DailyActivityRecord } from "@/lib/types";
import { ACTIVITY_CATEGORY_LABELS } from "@/lib/types";
import { todayIso } from "@/lib/utils/date";

function ActivityForm({ activity }: { activity: DailyActivityRecord }) {
  const { saveActivityProgress, replaceTodayActivity, data } = useApp();
  const [response, setResponse] = useState(activity.personalResponse ?? "");
  const [reflection, setReflection] = useState(activity.reflectionAnswer ?? "");
  const [saved, setSaved] = useState(Boolean(activity.completedAt));
  const [draftSaved, setDraftSaved] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const limitations = data.preferences.physicalLimitations.trim();

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title={activity.title}
        subtitle={`${ACTIVITY_CATEGORY_LABELS[activity.category]} · circa ${activity.durationMinutes} minuti`}
      />

      {limitations ? (
        <Card className="border-accent/30 bg-accent-soft/40">
          <p className="text-sm text-fg-muted">
            Adatta i passi ai tuoi limiti: <span className="text-fg">{limitations}</span>
          </p>
        </Card>
      ) : null}

      <Card>
        <h3 className="font-semibold">Obiettivo</h3>
        <p className="mt-2 text-fg-muted">{activity.objective}</p>
      </Card>

      <Card>
        <h3 className="font-semibold">Introduzione</h3>
        <p className="mt-2 text-fg-muted">{activity.introduction}</p>
      </Card>

      <Card>
        <h3 className="font-semibold">Scrittura o principio</h3>
        <p className="mt-1 text-sm text-fg-muted">Tocca un riferimento per aprirlo in JW Library.</p>
        <ScriptureList references={activity.scriptureReferences} />
      </Card>

      <Card>
        <h3 className="font-semibold">Istruzioni pratiche</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-fg-muted">
          {activity.instructions.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Card>

      <Card>
        <label className="font-semibold" htmlFor="response">
          Risposta personale
        </label>
        <p className="mt-1 text-sm text-fg-muted">{activity.writingPrompt}</p>
        <textarea
          id="response"
          className="mt-3 min-h-28 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
        />
      </Card>

      <Card>
        <label className="font-semibold" htmlFor="reflection">
          Domanda di riflessione
        </label>
        <p className="mt-1 text-sm text-fg-muted">{activity.reflectionQuestion}</p>
        <textarea
          id="reflection"
          className="mt-3 min-h-24 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />
      </Card>

      <Card>
        <h3 className="font-semibold">Azione concreta di oggi</h3>
        <p className="mt-2 text-fg-muted">{activity.dailyAction}</p>
      </Card>

      {activity.sourceReferences?.length ? (
        <Card>
          <h3 className="font-semibold">Fonti / riferimenti</h3>
          <ul className="mt-2 space-y-2 text-sm text-fg-muted">
            {activity.sourceReferences.map((s) => (
              <li key={`${s.organization}-${s.title}`}>
                <strong>{s.title}</strong> — {s.organization}
                {s.note ? `. ${s.note}` : ""}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid gap-2">
        <Button
          className="w-full"
          onClick={async () => {
            await saveActivityProgress(activity.id, {
              personalResponse: response,
              reflectionAnswer: reflection,
              completedAt: new Date().toISOString(),
            });
            setSaved(true);
            setDraftSaved(false);
          }}
        >
          Completa attività
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={async () => {
            await saveActivityProgress(activity.id, {
              personalResponse: response,
              reflectionAnswer: reflection,
            });
            setDraftSaved(true);
          }}
        >
          Salva bozza
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          disabled={replacing || Boolean(activity.completedAt)}
          onClick={async () => {
            if (!confirm("Sostituire l'attività di oggi con un'altra? La bozza attuale non verrà tenuta.")) {
              return;
            }
            setReplacing(true);
            try {
              await replaceTodayActivity();
            } finally {
              setReplacing(false);
            }
          }}
        >
          {replacing ? "Cambio in corso…" : "Cambia attività di oggi"}
        </Button>
      </div>
      {saved ? (
        <p className="text-center text-sm text-ok">Attività registrata. Grazie per il tempo dedicato.</p>
      ) : null}
      {draftSaved && !saved ? (
        <p className="text-center text-sm text-ok">Bozza salvata. Puoi riprendere quando vuoi.</p>
      ) : null}
    </div>
  );
}

export default function AttivitaPage() {
  const { ready, ensureTodayActivity, getActivityForDate } = useApp();
  const date = todayIso();
  const activity = getActivityForDate(date);

  useEffect(() => {
    if (!ready) return;
    void ensureTodayActivity();
  }, [ready, ensureTodayActivity]);

  if (!ready || !activity) {
    return <p className="text-fg-muted">Preparazione dell&apos;attività…</p>;
  }

  return <ActivityForm key={activity.id} activity={activity} />;
}
