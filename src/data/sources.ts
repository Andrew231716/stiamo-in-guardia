import type { SourceItem } from "@/lib/types";

/**
 * Solo link ufficiali verificabili. Nessun URL inventato.
 * Se un articolo specifico non può essere verificato qui, si punta
 * alla ricerca o alla home dell'organizzazione.
 */
export const SOURCES: SourceItem[] = [
  {
    id: "jw-home",
    title: "JW.org — sito ufficiale dei Testimoni di Geova",
    organization: "Watch Tower Bible and Tract Society",
    url: "https://www.jw.org/",
    sourceType: "spiritual",
    description:
      "Punto di accesso ufficiale a articoli, Bibbia e pubblicazioni. Cerca materiali su tentazione, purezza morale, preghiera e padronanza di sé.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-wol",
    title: "Biblioteca online Watchtower (WOL)",
    organization: "Watch Tower Bible and Tract Society",
    url: "https://wol.jw.org/",
    sourceType: "spiritual",
    description:
      "Biblioteca ufficiale per consultare pubblicazioni e riferimenti biblici. Usa la ricerca per titoli come «Stiamo in guardia per non cadere in tentazione».",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "jw-bible",
    title: "Bibbia online su JW.org",
    organization: "Watch Tower Bible and Tract Society",
    url: "https://www.jw.org/finder?wtlocale=I&prefer=lang&bible=",
    sourceType: "spiritual",
    description: "Consultazione della Bibbia e dei riferimenti scritturistici citati nell'app.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "nimh-caring",
    title: "Caring for Your Mental Health",
    organization: "National Institute of Mental Health (NIMH)",
    url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
    sourceType: "clinical",
    description:
      "Orientamenti generali sulla cura della salute mentale. Utile come contesto per benessere, non come trattamento specifico.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "samhsa-home",
    title: "SAMHSA — Substance Abuse and Mental Health Services Administration",
    organization: "SAMHSA",
    url: "https://www.samhsa.gov/",
    sourceType: "clinical",
    description:
      "Risorse ufficiali su salute mentale e comportamenti. Consultare materiali specifici sul sito per approfondimenti verificati.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "va-ptsd-mindfulness",
    title: "Mindfulness resources (VA)",
    organization: "U.S. Department of Veterans Affairs",
    url: "https://www.ptsd.va.gov/gethelp/mindfulness.asp",
    sourceType: "clinical",
    description:
      "Risorse VA su mindfulness. Alcune pratiche di consapevolezza (come osservare un impulso) si ispirano a questo ambito; non sostituiscono cure cliniche.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "nhs-mental-health",
    title: "Mental health — NHS",
    organization: "National Health Service (NHS)",
    url: "https://www.nhs.uk/mental-health/",
    sourceType: "clinical",
    description: "Portale NHS su salute mentale con informazioni generali e percorsi di aiuto.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "who-mental-health",
    title: "Mental health — World Health Organization",
    organization: "WHO",
    url: "https://www.who.int/health-topics/mental-health",
    sourceType: "clinical",
    description: "Panoramica WHO sulla salute mentale a livello globale.",
    lastVerifiedAt: "2026-09-22",
  },
  {
    id: "apa-psychology",
    title: "American Psychological Association",
    organization: "APA",
    url: "https://www.apa.org/",
    sourceType: "clinical",
    description:
      "Associazione professionale di psicologia. Consultare solo materiali ufficiali; non usare l'app come sostituto di un professionista.",
    lastVerifiedAt: "2026-09-22",
  },
];
