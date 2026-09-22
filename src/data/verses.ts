export interface VerseItem {
  reference: string;
  theme: string;
  note: string;
}

/** Riferimenti biblici (solo citazione del passo; il testo completo va letto nella propria Bibbia o su JW.org). */
export const PRAYER_VERSES: VerseItem[] = [
  {
    reference: "Matteo 26:41",
    theme: "vigilanza e preghiera",
    note: "Richiamo a rimanere vigilanti e a pregare per non cadere in tentazione.",
  },
  {
    reference: "Filippesi 4:6, 7",
    theme: "preghiera e pace",
    note: "Invito a presentare le proprie richieste a Dio con riconoscenza.",
  },
  {
    reference: "Proverbi 22:3",
    theme: "prudenza",
    note: "Il prudente prevede il pericolo e si ripara.",
  },
  {
    reference: "Salmo 55:22",
    theme: "affidarsi a Geova",
    note: "Invito a scaricare il proprio peso su Geova.",
  },
];

export const DAILY_VERSES: VerseItem[] = [
  ...PRAYER_VERSES,
  {
    reference: "Filippesi 4:8",
    theme: "pensieri casti",
    note: "Orientare la mente verso ciò che è vero, retto e puro.",
  },
  {
    reference: "Giobbe 31:1",
    theme: "patto con gli occhi",
    note: "Scelta consapevole di proteggere lo sguardo.",
  },
  {
    reference: "1 Tessalonicesi 4:3-5",
    theme: "santità e padronanza di sé",
    note: "Chiamata a vivere in santità e onore.",
  },
  {
    reference: "1 Timoteo 5:2",
    theme: "dignità delle donne",
    note: "Trattare le donne con purezza e rispetto.",
  },
  {
    reference: "2 Timoteo 2:22",
    theme: "fuggire i desideri giovanili",
    note: "Inseguire giustizia, fede, amore e pace.",
  },
  {
    reference: "Colossesi 3:5",
    theme: "far morire le tendenze terrene",
    note: "Invito a non nutrire ciò che allontana da Dio.",
  },
  {
    reference: "Salmo 97:10",
    theme: "odiare il male",
    note: "Amare Geova implica rifiutare ciò che è male.",
  },
  {
    reference: "Matteo 5:28",
    theme: "cuore e sguardo",
    note: "La purezza riguarda anche i pensieri deliberati.",
  },
  {
    reference: "Esodo 20:17",
    theme: "non desiderare",
    note: "Rispetto per ciò che non ci appartiene.",
  },
];

export function pickVerseForDate(dateIso: string, pool: VerseItem[] = DAILY_VERSES): VerseItem {
  const day = Number(dateIso.replaceAll("-", ""));
  return pool[Math.abs(day) % pool.length];
}

export function pickPrayerVerseForDate(dateIso: string): VerseItem {
  return pickVerseForDate(dateIso, PRAYER_VERSES);
}
