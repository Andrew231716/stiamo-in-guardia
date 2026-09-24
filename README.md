# Stiamo in guardia

Web app personale (PWA) per attività spirituali quotidiane, check-in, report e promemoria ispirati all’obiettivo «Fermati e prega col cuore».

> Non sostituisce un medico, uno psicologo, uno psichiatra o un responsabile spirituale.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Persistenza **local-first** con IndexedDB (funziona offline senza credenziali)
- Supabase predisposto (auth + RLS) — opzionale
- Recharts per i report
- Generazione / coach AI: analisi locale gratuita + provider cloud opzionale (Groq gratuito, Gemini, OpenAI)
- Deploy previsto su **Vercel**

## Avvio locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Variabili d’ambiente

Copia `.env.example` in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=
```

- Senza Supabase: l’app usa solo IndexedDB sul dispositivo.
- Senza chiavi AI cloud: il **coach locale** analizza comunque check-in e attività (gratuito, sul dispositivo).
- Con `GROQ_API_KEY` (consigliato, piano gratuito su [console.groq.com](https://console.groq.com)) o `GEMINI_API_KEY`, l’analisi può usare il modello cloud con consenso esplicito.
- Per i **promemoria push** (anche a app chiusa): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN` (Vercel Blob).
- **Non** mettere mai la `service_role` key nel client.

## Promemoria push

1. Genera chiavi VAPID (`npx web-push generate-vapid-keys`) e impostale su Vercel.
2. Collega uno store **Vercel Blob** (crea `BLOB_READ_WRITE_TOKEN`).
3. Imposta `CRON_SECRET` e `vercel.json` (cron Vercel; sul piano Hobby al massimo un paio di volte al giorno).
4. Sul telefono: installa la PWA sulla Home → Impostazioni → **Attiva promemoria push** → **Invia push di prova**.

Su iPhone le push web funzionano solo dall’icona Home (iOS 16.4+), non dalla scheda Safari.

## Supabase

1. Crea un progetto su [supabase.com](https://supabase.com).
2. Esegui `supabase/schema.sql` nell’SQL Editor.
3. Imposta URL e anon key su Vercel / `.env.local`.
4. Abilita Email auth (o il provider che preferisci).

Le policy RLS garantiscono che ogni utente legga/scriva solo i propri dati.

## Vercel

1. Collega il repository a Vercel.
2. Imposta le env vars.
3. Deploy. La PWA è servita con `manifest.webmanifest` e `sw.js`.

## Funzionalità principali

- Dashboard quotidiana (versetto, attività, preghiera, riepilogo 7 giorni)
- Rotazione attività su 7 categorie (libreria offline)
- Check-in del giorno precedente (impulsi involontari **non** conteggiati come ricadute)
- Report settimanali e mensili basati solo su dati presenti
- Modalità «Sono stanco o poco lucido»
- Fonti spirituali (JW.org / WOL) e cliniche ufficiali
- Coach AI su attività e check-in (locale gratis + cloud opzionale, fonti JW.org e siti ufficiali di psicologia)
- Export / import / cancellazione dati
- Promemoria **Web Push** discreti (anche a app chiusa, dopo installazione PWA)

## Test

```bash
npm test
npm run build
```

## Privacy

I dati del diario sono sensibili. Di default restano nel browser. Nessuna condivisione sociale, nessun tracking pubblicitario.
