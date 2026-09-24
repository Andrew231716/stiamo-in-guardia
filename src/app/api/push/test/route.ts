import { NextResponse } from "next/server";
import { z } from "zod";
import { configureWebPush, webpush } from "@/lib/push/vapid";
import { readPushStore } from "@/lib/push/store";

export const runtime = "nodejs";

const bodySchema = z.object({
  endpoint: z.string().url().optional(),
});

export async function POST(request: Request) {
  if (!configureWebPush()) {
    return NextResponse.json({ error: "VAPID non configurato" }, { status: 503 });
  }

  let endpoint: string | undefined;
  try {
    const json = await request.json().catch(() => ({}));
    endpoint = bodySchema.parse(json).endpoint;
  } catch {
    endpoint = undefined;
  }

  const store = await readPushStore();
  const targets = endpoint
    ? store.subscriptions.filter((s) => s.endpoint === endpoint)
    : store.subscriptions;

  if (targets.length === 0) {
    return NextResponse.json(
      { error: "Nessuna subscription. Attiva prima i promemoria push su questo dispositivo." },
      { status: 404 },
    );
  }

  const payload = JSON.stringify({
    title: "Stiamo in guardia",
    body: "Notifica push di prova: se la vedi a telefono spento dall'app, i promemoria funzioneranno anche a app chiusa.",
    url: "/",
    tag: "sig-test",
  });

  let sent = 0;
  let errors = 0;
  for (const sub of targets) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload,
        { TTL: 60 * 30, urgency: "high" },
      );
      sent += 1;
    } catch {
      errors += 1;
    }
  }

  return NextResponse.json({ ok: sent > 0, sent, errors });
}
