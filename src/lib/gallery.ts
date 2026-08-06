import type { StaticImageData } from 'next/image';

import slika01 from '@/assets/gallery/slika-01.jpg';
import slika02 from '@/assets/gallery/slika-02.jpg';
import slika03 from '@/assets/gallery/slika-03.jpg';
import slika04 from '@/assets/gallery/slika-04.jpg';
import slika05 from '@/assets/gallery/slika-05.jpg';
import slika06 from '@/assets/gallery/slika-06.jpg';
import slika07 from '@/assets/gallery/slika-07.jpg';
import slika08 from '@/assets/gallery/slika-08.jpg';
import slika09 from '@/assets/gallery/slika-09.jpg';
import slika10 from '@/assets/gallery/slika-10.jpg';
import slika11 from '@/assets/gallery/slika-11.jpg';
import slika12 from '@/assets/gallery/slika-12.jpg';
import slika13 from '@/assets/gallery/slika-13.jpg';
import slika14 from '@/assets/gallery/slika-14.jpg';

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  KAKO UBACITI PRAVE SLIKE TreeScape-a                                   │
 * │                                                                          │
 * │  Sve slike su trenutno prazni okviri s natpisom SLIKA 1, SLIKA 2…        │
 * │  Zamjena je jednostavna:                                                 │
 * │                                                                          │
 * │  1. Nazovi svoju sliku isto kao onu koju mijenjaš — npr. `slika-01.jpg`  │
 * │  2. Prebaci je u `src/assets/gallery/` i prepiši postojeću               │
 * │                                                                          │
 * │  Ništa drugo se ne dira. Next.js sam pravi WebP/AVIF verzije, računa     │
 * │  dimenzije i prikazuje zamućeni pregled dok se slika učitava.            │
 * │                                                                          │
 * │  SLIKA 1 je naslovna — ona velika preko cijelog ekrana na vrhu. Neka     │
 * │  bude široka (npr. 2000×1200) i najljepša koju imaš.                     │
 * │  SLIKA 3 i SLIKA 6 su uspravne, ostale položene.                        │
 * │                                                                          │
 * │  OPISI: `alt` (za slijepe osobe i za Google) i natpis ispod slike više   │
 * │  ne stoje ovdje nego u rječnicima, u `src/lib/i18n/dictionaries/` pod    │
 * │  `gallery.itemAlt` i `gallery.itemCaption` — jer ih treba na sva tri     │
 * │  jezika. Dok stoje označene prazne slike, ispisuju samo redni broj;      │
 * │  kad ubaciš prave, tamo opiši šta se na svakoj vidi.                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

export interface GalleryImage {
  image: StaticImageData;
  /** Redni broj slike — po njemu rječnik daje `alt` i natpis. */
  n: number;
  /** Vizuelna težina u mreži — `wide` i `tall` prave zanimljiviji raspored. */
  span?: 'wide' | 'tall';
}

/** Velika slika na vrhu stranice. Opis stoji u rječniku (`hero.imageAlt`). */
export const HERO_IMAGE = slika01;

/** Slika uz tekst "O kući". Opis stoji u rječniku (`about.imageAlt`). */
export const ABOUT_IMAGE = slika03;

export const GALLERY: GalleryImage[] = [
  { image: slika02, n: 2, span: 'wide' },
  { image: slika04, n: 4 },
  { image: slika06, n: 6, span: 'tall' },
  { image: slika03, n: 3, span: 'tall' },
  { image: slika05, n: 5 },
  { image: slika07, n: 7, span: 'wide' },
  { image: slika08, n: 8 },
  { image: slika09, n: 9 },
  { image: slika10, n: 10 },
  { image: slika11, n: 11 },
  { image: slika12, n: 12, span: 'wide' },
  { image: slika13, n: 13 },
  { image: slika14, n: 14 },
];
