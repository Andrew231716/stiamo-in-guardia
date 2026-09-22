"use client";

import { GUIDE_PHRASES } from "@/data/catalog";
import { Card, SectionTitle } from "@/components/ui/Card";

export default function SpiritualitaPage() {
  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle
        title="Educazione spirituale"
        subtitle="Prospettiva religiosa dei Testimoni di Geova, distinta da affermazioni scientifiche."
      />

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
          con santità e onore. Versetto principale: 1 Tessalonicesi 4:3-5. La padronanza di sé è una capacità positiva, non
          odio verso il proprio corpo.
        </p>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Dignità delle donne</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Basato su 1 Timoteo 5:2. Ogni donna è prima di tutto una persona con dignità, valore, qualità, sentimenti,
          obiettivi, una vita personale e il diritto alla propria intimità.
        </p>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Rispetto dell&apos;intimità altrui</h3>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">{GUIDE_PHRASES.intimacy}</p>
        <p className="mt-3 text-xs text-fg-muted">
          Il paragone del «rubare» può essere una metafora personale di rispetto. Non è presentato come equivalenza
          dottrinale né come citazione biblica. Riferimenti utili: Matteo 5:28, Esodo 20:17, 1 Timoteo 5:2.
        </p>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Pensieri casti</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Filippesi 4:8 · Giobbe 31:1 · 2 Timoteo 2:22 · Colossesi 3:5 · Salmo 97:10 · Proverbi 22:3
        </p>
      </Card>

      <Card>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl">Avversione lucida</h3>
        <p className="mt-2 text-sm text-fg-muted">
          L&apos;obiettivo è sviluppare una forte avversione verso comportamenti contrari ai tuoi valori, senza odio verso
          te stesso. Per la pornografia, rifletti su promesse immediate, effetti nella tua esperienza, oggettificazione e
          abitudini. Per la masturbazione, il ragionamento religioso di JW.org (non un fatto scientifico) indica che
          ricorrervi come sfogo può alimentare l&apos;appetito sessuale, favorire un atteggiamento egocentrico e influenzare
          il modo di vedere gli altri. Consulta JW.org per i materiali ufficiali.
        </p>
        <p className="mt-4 font-medium text-brand">{GUIDE_PHRASES.aversion}</p>
      </Card>
    </div>
  );
}
