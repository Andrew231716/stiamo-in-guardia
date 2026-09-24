import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { patchSubscription, removeSubscription, upsertSubscription } from "@/lib/push/store";

export const runtime = "nodejs";

const settingsSchema = z.object({
  dailyActivity: z.object({ enabled: z.boolean(), time: z.string().regex(/^\d{2}:\d{2}$/) }),
  checkIn: z.object({ enabled: z.boolean(), time: z.string().regex(/^\d{2}:\d{2}$/) }),
  prayer: z.object({ enabled: z.boolean(), time: z.string().regex(/^\d{2}:\d{2}$/) }),
});

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(10),
    auth: z.string().min(8),
  }),
  timezone: z.string().min(1).max(80).default("Europe/Rome"),
  settings: settingsSchema,
  userAgent: z.string().max(400).optional(),
});

const patchSchema = z.object({
  endpoint: z.string().url(),
  timezone: z.string().min(1).max(80).optional(),
  settings: settingsSchema.optional(),
});

const deleteSchema = z.object({
  endpoint: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const body = subscribeSchema.parse(await request.json());
    const saved = await upsertSubscription({
      id: randomUUID(),
      endpoint: body.endpoint,
      keys: body.keys,
      timezone: body.timezone,
      settings: body.settings,
      userAgent: body.userAgent,
    });
    return NextResponse.json({ ok: true, id: saved.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Payload non valido", details: err.flatten() }, { status: 400 });
    }
    console.error("push subscribe", err);
    return NextResponse.json({ error: "Salvataggio subscription fallito" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = patchSchema.parse(await request.json());
    const saved = await patchSubscription(body.endpoint, {
      timezone: body.timezone,
      settings: body.settings,
    });
    if (!saved) return NextResponse.json({ error: "Subscription non trovata" }, { status: 404 });
    return NextResponse.json({ ok: true, id: saved.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Payload non valido", details: err.flatten() }, { status: 400 });
    }
    console.error("push patch", err);
    return NextResponse.json({ error: "Aggiornamento fallito" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = deleteSchema.parse(await request.json());
    const removed = await removeSubscription(body.endpoint);
    return NextResponse.json({ ok: true, removed });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Rimozione fallita" }, { status: 500 });
  }
}
