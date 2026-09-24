import { NextResponse } from "next/server";
import { dispatchDuePushNotifications } from "@/lib/push/dispatch";
import { get, put } from "@vercel/blob";

export const runtime = "nodejs";
export const maxDuration = 60;

const LOCK_PATH = "push/cron-lock.json";
const MIN_INTERVAL_MS = 4 * 60 * 1000;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true; // senza secret: solo cooldown sotto
  const auth = request.headers.get("authorization") || "";
  if (auth === `Bearer ${secret}`) return true;
  // Vercel Cron imposta anche questo header
  if (request.headers.get("x-vercel-cron")) return true;
  // Consentito anche senza Bearer: il cooldown evita abusi; i send sono idempotenti.
  return true;
}

async function acquireCooldown(): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  try {
    const existing = await get(LOCK_PATH, { access: "private", useCache: false });
    if (existing?.stream) {
      const text = await new Response(existing.stream).text();
      const parsed = JSON.parse(text || "{}") as { at?: string };
      if (parsed.at) {
        const last = Date.parse(parsed.at);
        if (Number.isFinite(last) && Date.now() - last < MIN_INTERVAL_MS) {
          return false;
        }
      }
    }
  } catch {
    /* first run */
  }
  try {
    await put(LOCK_PATH, JSON.stringify({ at: new Date().toISOString() }), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  } catch {
    /* ignore lock write errors */
  }
  return true;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ok = await acquireCooldown();
  if (!ok) {
    return NextResponse.json({ ok: true, skipped: "cooldown", at: new Date().toISOString() });
  }
  const result = await dispatchDuePushNotifications();
  return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() });
}

export async function POST(request: Request) {
  return GET(request);
}
