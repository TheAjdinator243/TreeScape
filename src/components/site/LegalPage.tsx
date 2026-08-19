import Link from 'next/link';

import type { LegalDoc } from '@/lib/legal';
import { operatorNijePopunjen } from '@/lib/legal';

/**
 * Prikaz pravnog teksta — isti okvir za politiku privatnosti i uslove.
 *
 * Namjerno bez ijedne animacije i bez fotografija: ovo je stranica koju gost
 * otvara kad hoće nešto provjeriti, a ne kad hoće da mu se sviđa. Mjera reda
 * je oko 70 znakova, jer se ovo zaista čita, a ne preleti.
 *
 * ── Upozorenje na vrhu ────────────────────────────────────────────────────
 * Dok podaci o pružaocu usluge stoje na zamjenskim vrijednostima, iznad teksta
 * stoji vidljiva traka. Politika privatnosti bez imena onoga na koga se odnosi
 * je papir bez potpisa, a najlakše ju je objaviti upravo takvu — pa neka smeta
 * dok se ne popuni.
 */
export function LegalPage({ doc, backLabel }: { doc: LegalDoc; backLabel: string }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
      <h1 className="font-display text-3xl leading-tight text-coal-900 sm:text-4xl">
        {doc.title}
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-ink-700">{doc.lead}</p>
      <p className="mt-2 text-sm text-ink-400">{doc.updated}</p>

      {operatorNijePopunjen() && (
        <p
          role="alert"
          className="mt-8 rounded-xl border border-warn-600/30 bg-warn-600/8 px-5 py-4 text-sm leading-relaxed text-warn-600"
        >
          {doc.incompleteWarning}
        </p>
      )}

      <div className="mt-12 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl text-coal-900">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-3 leading-relaxed text-ink-700">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <Link href="/" className="btn-ghost mt-14 inline-flex">
        {backLabel}
      </Link>
    </main>
  );
}
