import type { SourceItem } from "@/lib/types";

/**
 * Solo link ufficiali verificati (HTTP 200 al momento dell'inserimento).
 * Nessuna citazione testuale lunga inventata: descrizioni sintetiche e rinvio alla fonte.
 */
export const SOURCES: SourceItem[] = [
  {
    id: "jw-home",
    title: "JW.org — sito ufficiale dei Testimoni di Geova",
    organization: "Watch Tower Bible and Tract Society",
    url: "https://www.jw.org/it/",
    sourceType: "spiritual",
    description: "Punto di accesso ufficiale a Bibbia, riviste e pubblicazioni in italiano.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-wol",
    title: "Biblioteca online Watchtower (WOL)",
    organization: "Watch Tower Bible and Tract Society",
    url: "https://wol.jw.org/it/",
    sourceType: "spiritual",
    description: "Archivio ufficiale delle pubblicazioni. Ideale per approfondire un articolo completo.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-bible",
    title: "Bibbia online su JW.org",
    organization: "Watch Tower Bible and Tract Society",
    url: "https://www.jw.org/finder?wtlocale=I&prefer=lang&bible=",
    sourceType: "spiritual",
    description: "Consultazione della Bibbia e dei riferimenti citati nell'app.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-stiamo-in-guardia",
    title: "Stiamo in guardia per non cadere in tentazione",
    organization: "La Torre di Guardia — Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/2024485",
    sourceType: "spiritual",
    topics: ["tentazione", "purezza", "padronanza"],
    description:
      "Articolo di riferimento dell'app: riconoscere i punti deboli, stare in guardia ogni giorno e rafforzare le protezioni pratiche.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-resistere-tentazione",
    title: "Puoi resistere alla tentazione!",
    organization: "Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/2014245",
    sourceType: "spiritual",
    topics: ["tentazione", "pensieri_casti", "padronanza"],
    description:
      "Aiuta a interrompere lo sguardo e i pensieri deliberati, coltivare alternative positive e rialzarsi dopo una difficoltà.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-rinnovare-mente",
    title: "«Siate trasformati rinnovando la vostra mente»",
    organization: "La Torre di Guardia (studio) — JW.org",
    url: "https://www.jw.org/it/biblioteca-digitale/riviste/torre-di-guardia-studio-gennaio-2023/Siate-trasformati-rinnovando-la-vostra-mente/",
    sourceType: "spiritual",
    topics: ["rinnovare_mente", "amare_bene"],
    description:
      "Spiega come cambiare progressivamente il modo di pensare allineandosi alla volontà di Geova (Romani 12:2), non con ritocchi superficiali.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-vecchia-personalita",
    title: "Puoi ‘spogliarti della vecchia personalità’",
    organization: "Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/2022320",
    sourceType: "spiritual",
    topics: ["rinnovare_mente", "amare_bene", "pensieri_casti"],
    description:
      "Collega Romani 12:9 all'imparare a detestare ciò che è malvagio e a proteggere la mente respingendo subito i pensieri sbagliati.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-odiare-male",
    title: "È bene odiare il male?",
    organization: "Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/1960680",
    sourceType: "spiritual",
    topics: ["amare_bene"],
    description:
      "Riflette sul dovere cristiano di aborrire ciò che è malvagio e di attenersi a ciò che è buono (Romani 12:9), secondo le norme bibliche.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-cose-che-dio-odia",
    title: "Trovate piacevoli le cose che Dio odia?",
    organization: "Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/1980569",
    sourceType: "spiritual",
    topics: ["amare_bene", "padronanza"],
    description:
      "Aiuta a sviluppare un'avversione sincera verso ciò che dispiace a Geova, collegata all'amore per Lui e alla padronanza di sé.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-purezza-bellezza",
    title: "La purezza morale è la bellezza dei giovani",
    organization: "Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/1989804",
    sourceType: "spiritual",
    topics: ["purezza", "pensieri_casti", "amare_bene"],
    description:
      "Sottolinea il bisogno di amare ciò che è bene e odiare ciò che è male, e di riempire la mente secondo Filippesi 4:8.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-moralmente-puri",
    title: "Possiamo rimanere moralmente puri",
    organization: "Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/2000803",
    sourceType: "spiritual",
    topics: ["purezza", "pensieri_casti", "padronanza"],
    description:
      "Collega l'amore per Geova all'odio per il male e invita a nutrire la mente di cose caste, scegliendo con cura ciò che si guarda e si ascolta.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-pensare-sesso",
    title: "Come posso smettere di pensare sempre al sesso?",
    organization: "Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/1102008131",
    sourceType: "spiritual",
    topics: ["pensieri_casti", "padronanza", "tentazione"],
    description:
      "Distingue gli impulsi normali dalla scelta di alimentarli; propone compagnie, attività, preghiera e padronanza pratica dei pensieri.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-padronanza-protezione",
    title: "La padronanza di sé è una protezione",
    organization: "Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/1976640",
    sourceType: "spiritual",
    topics: ["padronanza"],
    description:
      "Presenta la padronanza di sé come frutto dello spirito e protezione concreta nelle situazioni di pressione.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-padronanza-progresso",
    title: "La padronanza di sé è essenziale per il progresso",
    organization: "Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/1967483",
    sourceType: "spiritual",
    topics: ["padronanza", "rinnovare_mente"],
    description:
      "Incoraggia a coltivare con impegno la padronanza di sé come parte del progresso cristiano (2 Pietro 1:5, 6).",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-porno-diversivo",
    title: "Pornografia: solo un innocuo diversivo?",
    organization: "Biblioteca online Watchtower",
    url: "https://wol.jw.org/it/wol/d/r6/lp-i/102002485",
    sourceType: "spiritual",
    topics: ["pornografia", "purezza", "amare_bene"],
    description:
      "Prospettiva spirituale su come la pornografia alimenta desideri egocentrici e ostacola pensieri casti e rispetto altrui.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-abitudini-dipendenze",
    title: "Cattive abitudini e dipendenze — aiuto dalla Bibbia",
    organization: "JW.org",
    url: "https://www.jw.org/it/cosa-dice-la-Bibbia/pace-interiore-serenita/cattive-abitudini-e-dipendenze/",
    sourceType: "spiritual",
    topics: ["pornografia", "padronanza", "tentazione"],
    description:
      "Raccolta di articoli JW.org su abitudini dannose, inclusa la pornografia, con un approccio spirituale di speranza e cambiamento.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-amore-dio-approfondimenti",
    title: "Approfondimenti — Come rimanere nell'amore di Dio",
    organization: "JW.org",
    url: "https://www.jw.org/it/biblioteca-digitale/libri/amore-di-dio/approfondimenti/",
    sourceType: "spiritual",
    topics: ["purezza", "padronanza", "pensieri_casti"],
    description:
      "Approfondimenti su purezza morale e temi correlati secondo le norme bibliche presentate nella pubblicazione.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "nimh-caring",
    title: "Caring for Your Mental Health",
    organization: "National Institute of Mental Health (NIMH)",
    url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
    sourceType: "clinical",
    description:
      "Orientamenti generali sulla cura della salute mentale. Contesto di benessere, non trattamento specifico.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "samhsa-home",
    title: "SAMHSA — Substance Abuse and Mental Health Services Administration",
    organization: "SAMHSA",
    url: "https://www.samhsa.gov/",
    sourceType: "clinical",
    description: "Risorse ufficiali su salute mentale e comportamenti.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "va-ptsd-mindfulness",
    title: "Mindfulness resources (VA)",
    organization: "U.S. Department of Veterans Affairs",
    url: "https://www.ptsd.va.gov/gethelp/mindfulness.asp",
    sourceType: "clinical",
    description:
      "Risorse VA su mindfulness. Utile come contesto per osservare un impulso; non sostituisce cure cliniche.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "nhs-mental-health",
    title: "Mental health — NHS",
    organization: "National Health Service (NHS)",
    url: "https://www.nhs.uk/mental-health/",
    sourceType: "clinical",
    description: "Portale NHS su salute mentale con informazioni generali.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "who-mental-health",
    title: "Mental health — World Health Organization",
    organization: "WHO",
    url: "https://www.who.int/health-topics/mental-health",
    sourceType: "clinical",
    description: "Panoramica WHO sulla salute mentale.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "apa-psychology",
    title: "American Psychological Association",
    organization: "APA",
    url: "https://www.apa.org/",
    sourceType: "clinical",
    description: "Associazione professionale di psicologia. Solo materiali ufficiali; non sostituto di un professionista.",
    lastVerifiedAt: "2026-09-22",
  },
];

export const SOURCE_TOPIC_LABELS: Record<NonNullable<SourceItem["topics"]>[number], string> = {
  tentazione: "Tentazione e vigilanza",
  rinnovare_mente: "Rinnovare la mente",
  amare_bene: "Amare il bene, odiare il male",
  purezza: "Purezza morale",
  padronanza: "Padronanza di sé",
  pornografia: "Pornografia",
  pensieri_casti: "Pensieri casti",
};

export function getSpiritualSourcesByTopic(topic: NonNullable<SourceItem["topics"]>[number]): SourceItem[] {
  return SOURCES.filter((s) => s.sourceType === "spiritual" && s.topics?.includes(topic));
}

export function getFeaturedReading(): SourceItem[] {
  const ids = [
    "jw-stiamo-in-guardia",
    "jw-rinnovare-mente",
    "jw-vecchia-personalita",
    "jw-resistere-tentazione",
    "jw-pensare-sesso",
    "jw-porno-diversivo",
  ];
  return ids.map((id) => SOURCES.find((s) => s.id === id)).filter(Boolean) as SourceItem[];
}
