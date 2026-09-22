# Stiamo in guardia

Web app personale (PWA) per attività spirituali quotidiane, check-in, report e promemoria ispirati all’obiettivo «Fermati e prega col cuore».

> Non sostituisce un medico, uno psicologo, uno psichiatra o un responsabile spirituale.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Persistenza **local-first** con IndexedDB (funziona offline senza credenziali)
- Supabase predisposto (auth + RLS) — opzionale
- Recharts per i report
- Generazione attività: libreria locale (63 attività) + endpoint AI opzionale
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
```

- Senza Supabase: l’app usa solo IndexedDB sul dispositivo.
- Senza `OPENAI_API_KEY`: la Modalità B AI risponde con fallback locale.
- **Non** mettere mai la `service_role` key nel client.

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
- Export / import / cancellazione dati
- Promemoria locali discreti

## Test

```bash
npm test
npm run build
```

## Privacy

I dati del diario sono sensibili. Di default restano nel browser. Nessuna condivisione sociale, nessun tracking pubblicitario.
