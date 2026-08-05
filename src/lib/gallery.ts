import type { StaticImageData } from 'next/image';

import vilaVece from '@/assets/gallery/01-vila-vece.jpg';
import vilaDan from '@/assets/gallery/02-vila-dan.jpg';
import kucaUSumi from '@/assets/gallery/03-kuca-u-sumi.jpg';
import dnevniBoravak from '@/assets/gallery/04-dnevni-boravak.jpg';
import dnevniKuhinja from '@/assets/gallery/05-dnevni-kuhinja.jpg';
import kamin from '@/assets/gallery/06-kamin.jpg';
import kuhinja from '@/assets/gallery/07-kuhinja.jpg';
import spavacaSoba from '@/assets/gallery/08-spavaca-soba.jpg';
import spavacaSoba2 from '@/assets/gallery/09-spavaca-soba-2.jpg';
import kupatilo from '@/assets/gallery/10-kupatilo.jpg';
import stazaKrozSumu from '@/assets/gallery/11-staza-kroz-sumu.jpg';
import sumaIzZraka from '@/assets/gallery/12-suma-iz-zraka.jpg';
import pogledNaDolinu from '@/assets/gallery/13-pogled-na-dolinu.jpg';
import detalj from '@/assets/gallery/14-detalj.jpg';

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  KAKO ZAMIJENITI FOTOGRAFIJE PRAVIM SLIKAMA TreeScape-a                 │
 * │                                                                          │
 * │  1. Ubaci svoje slike u `src/assets/gallery/`.                          │
 * │  2. Gore promijeni putanje u `import` linijama (ili samo nazovi svoje    │
 * │     datoteke isto kao postojeće i prepiši ih).                          │
 * │  3. Ispravi `alt` tekst ispod — to čitaju i Google i čitači ekrana.      │
 * │                                                                          │
 * │  Ništa drugo se ne dira. Next.js sam pravi WebP/AVIF verzije, računa     │
 * │  dimenzije i generiše zamućeni pregled dok se slika učitava.             │
 * │                                                                          │
 * │  Trenutne slike su sa Unsplash-a (Unsplash License — besplatno za        │
 * │  komercijalnu upotrebu, bez obaveze potpisivanja autora). One su SAMO    │
 * │  privremene — obavezno ih zamijeni pravim slikama kuće prije objave.     │
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
  image: vilaVece,
  alt: 'Vila TreeScape uveče, osvijetljena među visokim stablima',
} as const;

/** Slika za dijeljenje na društvenim mrežama (Open Graph). */
export const OG_IMAGE = vilaVece;

export const GALLERY: GalleryImage[] = [
  {
    image: vilaDan,
    alt: 'Vanjski izgled vile TreeScape sa velikim stablom u dvorištu',
    caption: 'Kuća i dvorište',
    span: 'wide',
  },
  {
    image: dnevniBoravak,
    alt: 'Dnevni boravak sa velikim prozorima okrenutim prema šumi',
    caption: 'Dnevni boravak',
  },
  {
    image: kucaUSumi,
    alt: 'Drvena kuća sa terasom, okružena šumom',
    caption: 'Terasa iznad šume',
    span: 'tall',
  },
  {
    image: kuhinja,
    alt: 'Potpuno opremljena kuhinja sa tamnozelenim elementima',
    caption: 'Kuhinja',
    span: 'tall',
  },
  {
    image: kamin,
    alt: 'Dnevna soba sa kaminom i pogledom kroz velike prozore',
    caption: 'Kamin',
  },
  {
    image: dnevniKuhinja,
    alt: 'Otvoreni prostor dnevne sobe i kuhinje',
    caption: 'Otvoreni prostor',
    span: 'wide',
  },
  {
    image: spavacaSoba,
    alt: 'Spavaća soba sa udobnim krevetom i noćnom lampom',
    caption: 'Spavaća soba',
  },
  {
    image: spavacaSoba2,
    alt: 'Druga spavaća soba sa bračnim krevetom',
    caption: 'Druga spavaća soba',
  },
  {
    image: kupatilo,
    alt: 'Kupatilo sa tuš kabinom i dvostrukim umivaonikom',
    caption: 'Kupatilo',
  },
  {
    image: detalj,
    alt: 'Detalj enterijera — fotelja i podna lampa uz zid',
    caption: 'Kutak za čitanje',
  },
  {
    image: stazaKrozSumu,
    alt: 'Šumska staza obasjana jutarnjim suncem',
    caption: 'Staze oko kuće',
    span: 'wide',
  },
  {
    image: pogledNaDolinu,
    alt: 'Pogled na dolinu i planine u izmaglici',
    caption: 'Pogled na dolinu',
  },
  {
    image: sumaIzZraka,
    alt: 'Šuma i put snimljeni iz zraka',
    caption: 'Okolina iz zraka',
  },
];
