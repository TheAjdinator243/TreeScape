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
 * │  3. Ispod, u spisku, promijeni `alt` i `caption` da opisuju tvoju sliku  │
 * │                                                                          │
 * │  Ništa drugo se ne dira. Next.js sam pravi WebP/AVIF verzije, računa     │
 * │  dimenzije i prikazuje zamućeni pregled dok se slika učitava.            │
 * │                                                                          │
 * │  SLIKA 1 je naslovna — ona velika preko cijelog ekrana na vrhu. Neka     │
 * │  bude široka (npr. 2000×1200) i najljepša koju imaš.                     │
 * │  SLIKA 3 i SLIKA 6 su uspravne, ostale položene.                        │
 * │                                                                          │
 * │  `alt` je opis za slijepe osobe i za Google — nikad ga ne ostavljaj      │
 * │  prazan i nemoj u njega pisati "slika", nego šta se na slici vidi.       │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

export interface GalleryImage {
  image: StaticImageData;
  /** Opis za čitače ekrana i pretraživače. Nikad ne ostavljaj prazno. */
  alt: string;
  /** Natpis koji se vidi u galeriji. */
  caption: string;
  /** Vizuelna težina u mreži — `wide` i `tall` prave zanimljiviji raspored. */
  span?: 'wide' | 'tall';
}

/** Velika slika na vrhu stranice. */
export const HERO_IMAGE = {
  image: slika01,
  alt: 'Vila TreeScape',
} as const;

/** Slika za dijeljenje na društvenim mrežama (Open Graph). */
export const OG_IMAGE = slika01;

/** Slika uz tekst "O kući". */
export const ABOUT_IMAGE = {
  image: slika03,
  alt: 'Vila TreeScape izvana',
} as const;

export const GALLERY: GalleryImage[] = [
  { image: slika02, alt: 'Slika 2', caption: 'Slika 2', span: 'wide' },
  { image: slika04, alt: 'Slika 4', caption: 'Slika 4' },
  { image: slika06, alt: 'Slika 6', caption: 'Slika 6', span: 'tall' },
  { image: slika03, alt: 'Slika 3', caption: 'Slika 3', span: 'tall' },
  { image: slika05, alt: 'Slika 5', caption: 'Slika 5' },
  { image: slika07, alt: 'Slika 7', caption: 'Slika 7', span: 'wide' },
  { image: slika08, alt: 'Slika 8', caption: 'Slika 8' },
  { image: slika09, alt: 'Slika 9', caption: 'Slika 9' },
  { image: slika10, alt: 'Slika 10', caption: 'Slika 10' },
  { image: slika11, alt: 'Slika 11', caption: 'Slika 11' },
  { image: slika12, alt: 'Slika 12', caption: 'Slika 12', span: 'wide' },
  { image: slika13, alt: 'Slika 13', caption: 'Slika 13' },
  { image: slika14, alt: 'Slika 14', caption: 'Slika 14' },
];
