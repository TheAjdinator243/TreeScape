import { Instrument_Serif, Manrope } from 'next/font/google';

import { SmoothScroll } from '@/components/motion/SmoothScroll';

/**
 * Pismo "plus" izgleda.
 *
 * `preload: false` je isti razlog kao kod arapskog fonta u glavnom rasporedu i
 * kod pisama "pro" izgleda: bez njega bi Next ova dva pisma slao SVAKOM
 * posjetiocu, i onima koji nikad ne otvore /treescapeproplus. Ovako
 * promjenljive stoje samo na ovom podstablu, pa ih preuzme samo onaj ko je
 * zaista ovdje.
 *
 * Instrument Serif ima jedan jedini rez (400) i to je namjeran izbor, ne
 * ograničenje: pismo je već visokokontrastno i usko, pa mu podebljanje samo
 * kvari crtež. Sve što treba da bude jače ide u Manrope, koji ima raspon.
 */
const plusDisplay = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
  weight: ['400'],
  preload: false,
});

const plusSans = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  display: 'swap',
  preload: false,
});

/**
 * Klasa `plus` uključuje cijelu treću kožu (vidi globals.css). Stoji na
 * omotaču, a ne na <html>, pa i osnovni sajt i "pro" ostaju netaknuti — tri
 * verzije žive jedna pored druge u istoj aplikaciji, na istoj bazi.
 */
export default function PlusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`plus ${plusDisplay.variable} ${plusSans.variable}`}>
      {/*
        Bez JavaScripta se redovi naslova nikad ne izmjere, pa bi ostali na
        `opacity: 0` — tekst bi jednostavno nestao. Ovo ih odmah pokaže.

        Stoji ovdje, a ne u glavnom rasporedu, jer se otkrivanje red po red
        koristi samo na ovoj stranici. (Isto pravilo za `.reveal` blokove već
        stoji u `app/layout.tsx` i vrijedi za sve tri verzije.)
      */}
      <noscript>
        <style>{`.line-reveal-word { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>

      {/* Glatki skrol s inercijom — samo na ovoj stranici, i samo onome ko
          nije tražio manje animacija. */}
      <SmoothScroll />

      {children}
    </div>
  );
}
