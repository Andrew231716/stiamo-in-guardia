"use client";

import Link from "next/link";
import { GUIDE_PHRASES } from "@/data/catalog";
import { getFeaturedReading, getSpiritualSourcesByTopic } from "@/data/sources";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScriptureLink, ScriptureList } from "@/components/bible/ScriptureLink";

export default function SpiritualitaPage() {
  const readings = getFeaturedReading();

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Trasformare il modo di pensare"
        subtitle="Obiettivo: autocontrollo dei pensieri e delle azioni. Imparare ad amare ciò che è bene e a odiare ciò che è male — senza odiare te stesso."
      />

      <Card className="border-brand/20 bg-brand-soft/40">
        <p className="text-sm font-medium text-brand">{GUIDE_PHRASES.loveGoodHateEvil}</p>
        <p className="mt-2 text-sm text-fg-muted">{GUIDE_PHRASES.renewMind}</p>
        <div className="mt-3">
          <ScriptureLink reference="Romani 12:2" />
        </div>
        <div className="mt-2">
          <ScriptureLink reference="Romani 12:9" />
        </div>
        <p className="mt-3 text-xs text-fg-muted">{GUIDE_PHRASES.romans129}</p>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Amare il bene, odiare il male</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Secondo la prospettiva biblica presentata nelle pubblicazioni JW.org, non basta «non fare» ciò che è sbagliato:
          occorre coltivare un affetto sincero per ciò che Geova ama e imparare a odiare ciò che Egli odia. Questo riguarda
          pensieri, sguardi, abitudini e scelte — non il valore della tua persona.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-fg-muted">
          <li>Amare ciò che è bene significa riempire la mente di ciò che è vero, giusto e casto.</li>
          <li>Odiare ciò che è male significa trovare ripugnante alimentare ciò che allontana da Geova.</li>
          <li>Si odia la condotta dannosa, non se stessi e non il proprio corpo.</li>
        </ul>
        <ScriptureList className="mt-3" references={["Salmo 97:10", "Romani 12:9", "Filippesi 4:8"]} />
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Impulso involontario e scelta volontaria</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-fg-muted">
          <li>Un impulso sessuale può comparire spontaneamente.</li>
          <li>Un&apos;eccitazione involontaria non equivale automaticamente a una scelta morale.</li>
          <li>Un pensiero intrusivo non è necessariamente un pensiero deliberatamente alimentato.</li>
          <li>Scegliere di soffermarsi volontariamente su fantasie, immagini o ricerche è un comportamento distinto.</li>
          <li>La padronanza di sé consiste nel poter scegliere come rispondere.</li>
        </ul>
        <p className="mt-4 font-medium text-brand">{GUIDE_PHRASES.impulse}</p>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Sessualità come dono</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Secondo la prospettiva biblica, le facoltà sessuali sono un dono di Geova da utilizzare secondo il suo proposito,
          con santità e onore. La padronanza di sé è una capacità positiva, non odio verso il proprio corpo.
        </p>
        <p className="mt-3 text-sm text-fg-muted">Versetto principale:</p>
        <div className="mt-1">
          <ScriptureLink reference="1 Tessalonicesi 4:3-5" />
        </div>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Dignità delle donne</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Ogni donna è prima di tutto una persona con dignità, valore, qualità, sentimenti, obiettivi, una vita personale e
          il diritto alla propria intimità.
        </p>
        <div className="mt-3">
          <ScriptureLink reference="1 Timoteo 5:2" />
        </div>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Rispetto dell&apos;intimità altrui</h3>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">{GUIDE_PHRASES.intimacy}</p>
        <p className="mt-3 text-xs text-fg-muted">
          Il paragone del «rubare» può essere una metafora personale di rispetto. Non è presentato come equivalenza
          dottrinale né come citazione biblica.
        </p>
        <ScriptureList references={["Matteo 5:28", "Esodo 20:17", "1 Timoteo 5:2"]} />
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Pensieri casti e padronanza</h3>
        <ScriptureList
          references={[
            "Filippesi 4:8",
            "Giobbe 31:1",
            "2 Timoteo 2:22",
            "Colossesi 3:5",
            "Salmo 97:10",
            "Proverbi 22:3",
            "2 Pietro 1:5, 6",
          ]}
        />
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Desiderio di sposarsi e pazienza</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Desiderare una moglie e una compagnia fedele è un desiderio umano comprensibile. Secondo le pubblicazioni
          JW.org, puoi parlarne apertamente a Geova, non disperare nell&apos;attesa e chiedere sostegno emotivo. Allo stesso
          tempo, le pubblicazioni ricordano con chiarezza che Geova non promette un coniuge a nessuno; però si interessa
          dei tuoi desideri e dei tuoi bisogni. Se il matrimonio è davvero ciò di cui hai bisogno, sa il modo migliore
          per provvedere — nei tempi e nei modi giusti.
        </p>
        <p className="mt-3 text-sm font-medium text-brand">{GUIDE_PHRASES.marriagePatience}</p>
        <p className="mt-2 text-sm text-fg-muted">{GUIDE_PHRASES.patienceFocus}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-fg-muted">
          <li>La frustrazione per l&apos;attesa non deve abbassare la guardia né spingere a decisioni disperate.</li>
          <li>Quando la mente resta vuota o fissata solo sul desiderio, crescono scoraggiamento e impulsi sbagliati.</li>
          <li>Concentrarsi su altro di buono (servizio, amicizie, lavoro utile, studio, preghiera) è una protezione pratica.</li>
          <li>Sposarsi «solo nel Signore» protegge meglio di una scelta affrettata.</li>
          <li>Puoi coltivare una vita piena già ora, mentre aspetti con pazienza.</li>
        </ul>
        <ScriptureList
          className="mt-3"
          references={["Filippesi 4:6, 7", "Ebrei 13:6", "Salmo 145:16", "Matteo 6:32", "1 Corinti 7:39"]}
        />
        <div className="mt-4 space-y-2">
          {getSpiritualSourcesByTopic("matrimonio_pazienza")
            .slice(0, 4)
            .map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-line px-4 py-3 text-sm hover:border-brand/40"
              >
                <span className="font-semibold text-brand-deep">{s.title}</span>
                <span className="mt-1 block text-xs text-fg-muted">{s.description}</span>
              </a>
            ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Avversione lucida</h3>
        <p className="mt-2 text-sm text-fg-muted">
          L&apos;obiettivo è sviluppare una forte avversione verso comportamenti contrari ai tuoi valori, senza odio verso
          te stesso. Per ragionamenti spirituali ufficiali su pornografia e purezza, usa le letture qui sotto (JW.org /
          WOL). Distingui sempre convinzioni religiose e affermazioni scientifiche.
        </p>
        <p className="mt-4 font-medium text-brand">{GUIDE_PHRASES.aversion}</p>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Letture consigliate da JW.org</h3>
        <p className="mt-1 text-sm text-fg-muted">
          Articoli ufficiali verificati. Apri e leggi sulla fonte: qui trovi solo il titolo e una breve descrizione.
        </p>
        <div className="mt-4 space-y-3">
          {readings.map((s) => (
            <article key={s.id} className="rounded-2xl border border-line p-4">
              <h4 className="font-semibold text-brand-deep">{s.title}</h4>
              <p className="mt-1 text-sm text-fg-muted">{s.description}</p>
              <a className="mt-2 inline-block text-sm text-brand underline" href={s.url} target="_blank" rel="noreferrer">
                Apri su JW.org / WOL
              </a>
            </article>
          ))}
        </div>
        <Link href="/fonti" className="mt-4 block">
          <Button variant="secondary" className="w-full">
            Vedi tutte le fonti per argomento
          </Button>
        </Link>
      </Card>
    </div>
  );
}
