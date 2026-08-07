import { Cormorant_Garamond, Jost } from 'next/font/google';

/**
 * Pismo "pro" izgleda.
 *
 * `preload: false` je isti razlog kao kod arapskog fonta u glavnom rasporedu:
 * bez njega bi Next ova dva pisma slao SVAKOM posjetiocu, i onima koji nikad
 * ne otvore /treescapepro. Ovako promjenljive stoje samo na ovom podstablu, pa
 * ih preuzme samo onaj ko je zaista ovdje.
 *
 * Cormorant je visokokontrastni serif — u tankom rezu i velikoj veličini je
 * ono što oko čita kao "skupo"; u sitnom bi bio nečitljiv, pa je i ne dobija.
 * Jost nosi sve ostalo: geometrijski grotesk, uzak i miran.
 */
const proDisplay = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500'],
  preload: false,
});

const proSans = Jost({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jost',
  display: 'swap',
  weight: ['300', '400', '500'],
  preload: false,
});

/**
 * Klasa `pro` uključuje cijelu drugu kožu (vidi globals.css). Stoji na omotaču,
 * a ne na <html>, pa glavni sajt ostaje netaknut — dvije verzije žive jedna
 * pored druge u istoj aplikaciji, na istoj bazi.
 */
export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`pro ${proDisplay.variable} ${proSans.variable} bg-onyx-950 text-ivory-100`}>
      {children}
    </div>
  );
}
