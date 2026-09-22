/**
 * Collegamenti a JW Library / JW.org per riferimenti biblici.
 * Formato ufficiale tipico: jwlibrary:///finder?bible=BBCCCVVV
 * (libro 2 cifre, capitolo 3, versetto 3)
 */

export interface ParsedScripture {
  bookNumber: number;
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  display: string;
}

/** Nomi italiani (e alcune varianti) → numero libro TNM (1–66). */
const BOOK_ALIASES: Array<{ number: number; names: string[] }> = [
  { number: 1, names: ["genesi", "ge"] },
  { number: 2, names: ["esodo", "eso"] },
  { number: 3, names: ["levitico", "le"] },
  { number: 4, names: ["numeri", "nu"] },
  { number: 5, names: ["deuteronomio", "de"] },
  { number: 6, names: ["giosue", "giosuè", "gs"] },
  { number: 7, names: ["giudici", "gdc"] },
  { number: 8, names: ["rut"] },
  { number: 9, names: ["1 samuele", "1samuele", "1sa"] },
  { number: 10, names: ["2 samuele", "2samuele", "2sa"] },
  { number: 11, names: ["1 re", "1re"] },
  { number: 12, names: ["2 re", "2re"] },
  { number: 13, names: ["1 cronache", "1cronache", "1cr"] },
  { number: 14, names: ["2 cronache", "2cronache", "2cr"] },
  { number: 15, names: ["esdra", "edr"] },
  { number: 16, names: ["neemia", "ne"] },
  { number: 17, names: ["ester", "est"] },
  { number: 18, names: ["giobbe", "gb"] },
  { number: 19, names: ["salmi", "salmo", "sl"] },
  { number: 20, names: ["proverbi", "pr"] },
  { number: 21, names: ["ecclesiaste", "ec"] },
  { number: 22, names: ["cantico dei cantici", "cantico", "ca"] },
  { number: 23, names: ["isaia", "is"] },
  { number: 24, names: ["geremia", "ger"] },
  { number: 25, names: ["lamentazioni", "la"] },
  { number: 26, names: ["ezechiele", "ez"] },
  { number: 27, names: ["daniele", "da"] },
  { number: 28, names: ["osea", "os"] },
  { number: 29, names: ["gioele", "gl"] },
  { number: 30, names: ["amos", "am"] },
  { number: 31, names: ["abdia", "ab"] },
  { number: 32, names: ["giona", "gion"] },
  { number: 33, names: ["michea", "mic"] },
  { number: 34, names: ["naum", "na"] },
  { number: 35, names: ["abacuc", "hab"] },
  { number: 36, names: ["sofonia", "so"] },
  { number: 37, names: ["aggeo", "ag"] },
  { number: 38, names: ["zaccaria", "zac"] },
  { number: 39, names: ["malachia", "mal"] },
  { number: 40, names: ["matteo", "mt"] },
  { number: 41, names: ["marco", "mr"] },
  { number: 42, names: ["luca", "lu"] },
  { number: 43, names: ["giovanni", "gv"] },
  { number: 44, names: ["atti", "atti degli apostoli", "at"] },
  { number: 45, names: ["romani", "ro"] },
  { number: 46, names: ["1 corinti", "1corinti", "1 corinzi", "1corinzi", "1co"] },
  { number: 47, names: ["2 corinti", "2corinti", "2 corinzi", "2corinzi", "2co"] },
  { number: 48, names: ["galati", "gal"] },
  { number: 49, names: ["efesini", "ef"] },
  { number: 50, names: ["filippesi", "flp"] },
  { number: 51, names: ["colossesi", "col"] },
  { number: 52, names: ["1 tessalonicesi", "1tessalonicesi", "1te"] },
  { number: 53, names: ["2 tessalonicesi", "2tessalonicesi", "2te"] },
  { number: 54, names: ["1 timoteo", "1timoteo", "1ti"] },
  { number: 55, names: ["2 timoteo", "2timoteo", "2ti"] },
  { number: 56, names: ["tito", "tit"] },
  { number: 57, names: ["filemone", "flm"] },
  { number: 58, names: ["ebrei", "eb"] },
  { number: 59, names: ["giacomo", "gc"] },
  { number: 60, names: ["1 pietro", "1pietro", "1pi"] },
  { number: 61, names: ["2 pietro", "2pietro", "2pi"] },
  { number: 62, names: ["1 giovanni", "1giovanni", "1gv"] },
  { number: 63, names: ["2 giovanni", "2giovanni", "2gv"] },
  { number: 64, names: ["3 giovanni", "3giovanni", "3gv"] },
  { number: 65, names: ["giuda", "gda"] },
  { number: 66, names: ["rivelazione", "apocalisse", "ri", "ap"] },
];

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function findBook(rawBook: string): { number: number; name: string } | null {
  const n = normalize(rawBook);
  const sorted = BOOK_ALIASES.flatMap((b) =>
    b.names.map((name) => ({ number: b.number, name, len: name.length })),
  ).sort((a, b) => b.len - a.len);

  for (const entry of sorted) {
    if (n === normalize(entry.name) || n.startsWith(normalize(entry.name) + " ")) {
      const canonical = BOOK_ALIASES.find((b) => b.number === entry.number)?.names[0] ?? entry.name;
      return { number: entry.number, name: canonical };
    }
  }
  // exact match after removing dots
  const compact = n.replace(/\./g, "");
  for (const entry of sorted) {
    if (compact === normalize(entry.name).replace(/\./g, "")) {
      const canonical = BOOK_ALIASES.find((b) => b.number === entry.number)?.names[0] ?? entry.name;
      return { number: entry.number, name: canonical };
    }
  }
  return null;
}

function verseCode(book: number, chapter: number, verse: number): string {
  return `${String(book).padStart(2, "0")}${String(chapter).padStart(3, "0")}${String(verse).padStart(3, "0")}`;
}

/**
 * Analizza riferimenti come:
 * "Matteo 26:41", "Filippesi 4:6, 7", "1 Tessalonicesi 4:3-5", "Salmo 55:22"
 */
export function parseScriptureReference(reference: string): ParsedScripture | null {
  const cleaned = reference.replace(/\s+/g, " ").trim();
  // Book ... chapter:verses
  const match = cleaned.match(
    /^((?:[123]\s*)?[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.]*?)\s+(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?(?:\s*,\s*(\d{1,3}))?\s*$/u,
  );
  if (!match) return null;

  const bookPart = match[1].trim();
  const book = findBook(bookPart);
  if (!book) return null;

  const chapter = Number(match[2]);
  const verseStart = Number(match[3]);
  const verseEnd = Number(match[4] || match[5] || match[3]);
  if (!chapter || !verseStart || verseEnd < verseStart) return null;

  return {
    bookNumber: book.number,
    bookName: book.name,
    chapter,
    verseStart,
    verseEnd,
    display: cleaned,
  };
}

export function buildJwLibraryBibleParam(parsed: ParsedScripture): string {
  const start = verseCode(parsed.bookNumber, parsed.chapter, parsed.verseStart);
  if (parsed.verseEnd === parsed.verseStart) return start;
  const end = verseCode(parsed.bookNumber, parsed.chapter, parsed.verseEnd);
  return `${start}-${end}`;
}

/** Deep link che apre JW Library (se installata) sul passo indicato. */
export function buildJwLibraryUrl(reference: string, locale = "I"): string | null {
  const parsed = parseScriptureReference(reference);
  if (!parsed) return null;
  const bible = buildJwLibraryBibleParam(parsed);
  const params = new URLSearchParams({
    srcid: "jwlshare",
    wtlocale: locale,
    prefer: "lang",
    bible,
  });
  return `jwlibrary:///finder?${params.toString()}`;
}

/** Fallback web su JW.org (stesso codice biblico). */
export function buildJwOrgUrl(reference: string, locale = "I"): string | null {
  const parsed = parseScriptureReference(reference);
  if (!parsed) return null;
  const bible = buildJwLibraryBibleParam(parsed);
  const params = new URLSearchParams({
    srcid: "jwlshare",
    wtlocale: locale,
    prefer: "lang",
    bible,
  });
  return `https://www.jw.org/finder?${params.toString()}`;
}
