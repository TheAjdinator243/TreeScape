import { Instrument_Serif, Manrope } from 'next/font/google';

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
  return <div className={`plus ${plusDisplay.variable} ${plusSans.variable}`}>{children}</div>;
}
