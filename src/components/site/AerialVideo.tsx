'use client';

import { useEffect, useRef, useState } from 'react';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { Reveal } from '@/components/motion/Reveal';
import { calmMotion } from '@/components/motion/ticker';

import { SectionHead } from './SectionHead';

/**
 * Dvije datoteke istog snimka, isti kvalitet (CRF 21), različita rezolucija.
 *
 * Kartica sa snimkom je na telefonu široka oko 350 tačaka, što je i na ekranu s
 * trostrukom gustinom oko 1050 stvarnih tačaka — dakle ispod 1280 koliko ima
 * uža datoteka. Drugim riječima, na telefonu se veća datoteka NE BI vidjela kao
 * veća: ista slika, dva i po puta više podataka. Zato telefon dobija užu.
 */
const WIDE = '/video/pogled-iz-zraka.mp4';
const NARROW = '/video/pogled-iz-zraka-720.mp4';

/**
 * Snimak imanja iz drona.
 *
 * Snimak kreće sam čim uđe u kadar, bez ijednog klika, i staje čim iz kadra
 * izađe — video koji se vrti u kartici koju niko ne gleda troši i bateriju i
 * podatke. Nema nikakvih dugmadi preglednika preko slike: ovo nije snimak koji
 * se „gleda" nego kuća koja se pomjera, pa traka za premotavanje na njoj izgleda
 * kao da je neko zabunom ostavio player na stranici.
 *
 * ── Kad se ipak pojavi dugme ──────────────────────────────────────────────
 * Samo u jednom slučaju snimak namjerno NE krene sam: kad je posjetilac u
 * sistemu uključio „smanji animacije". Snimak iz drona je upravo ono zbog čega
 * ta postavka postoji — kamera koja se obrušava preko krošnji nekim ljudima
 * izaziva mučninu, i to im se ne smije desiti samo zato što su skrolali do
 * odjeljka. Štednja podataka se namjerno NE gleda: vlasnik je odlučio da snimak
 * treba da krene i tada.
 *
 * Dugme se pojavi i ako preglednik sam odbije da pusti snimak (na iPhoneu to
 * radi štedljivi režim). Tada je ono jedini način da se snimak uopšte vidi, pa
 * je bolje da postoji nego da ostane slika koja se ne miče.
 *
 * ── Dok se ne priđe, ne skida se ni bajt ──────────────────────────────────
 * Prvi posmatrač gleda široko (400px izvan ekrana) i služi samo da skidanje
 * krene malo prije nego što snimak zatreba, da ne kasni. Ko nikad ne dođe do
 * ovog odjeljka, ne plati ništa.
 */
export function AerialVideo() {
  const { t } = useI18n();
  const video = useRef<HTMLVideoElement>(null);

  /**
   * Koja se datoteka skida. `null` znači „još se nije prišlo odjeljku", i tako
   * je i pri prvom iscrtavanju na serveru, gdje se širina ekrana ionako ne zna.
   * Dok je `null`, u `<video>` nema `src` — pa preglednik nema šta ni da skida.
   */
  const [src, setSrc] = useState<string | null>(null);

  /** Snimak neće krenuti sam — bilo zato što je tako pošteno, bilo zato što preglednik nije dao. */
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const node = video.current;
    if (!node) return;

    // Odluka se donosi tek kad se odjeljku priđe, a ne pri učitavanju stranice:
    // tako se čita širina koju ekran ima U TOM TRENUTKU, pa okretanje telefona
    // usput ne ostavi pogrešnu datoteku.
    const decide = () => {
      setNeedsTap(calmMotion());
      setSrc(window.matchMedia('(min-width: 1024px)').matches ? WIDE : NARROW);
    };

    if (typeof IntersectionObserver === 'undefined') {
      decide();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          decide();
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = video.current;
    if (!node || !src || needsTap || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // `play()` vraća obećanje koje odbije ako preglednik ipak ne dozvoli
          // automatsko puštanje. To nije greška u kodu nego njegova odluka, pa
          // se ne prijavljuje — samo se pojavi dugme.
          void node.play().catch(() => setNeedsTap(true));
        } else {
          node.pause();
        }
      },
      // Prag je trećina kartice, a ne prva tačka: inače bi snimak krenuo dok mu
      // se vidi samo rub, a stao bi na svaki sitni pomjeraj prsta pri dnu.
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [src, needsTap]);

  const start = () => {
    setNeedsTap(false);
    void video.current?.play().catch(() => setNeedsTap(true));
  };

  return (
    <section id="video" className="grain relative bg-coal-900">
      <div className="section relative z-[2]">
        <SectionHead
          index={3}
          label={t.video.label}
          title={t.video.heading}
          lead={t.video.lead}
          tone="dark"
        />

        <Reveal variant="mask" delay={120} className="mt-14">
          <div className="relative overflow-hidden rounded-frame bg-coal-950 shadow-lift">
            <video
              ref={video}
              // Bez `playsInline` iOS otvori snimak preko cijelog ekrana umjesto
              // da ga pusti u kartici — a onda gost izgubi stranicu. Isti atribut
              // je i uslov da iOS uopšte pusti snimak bez klika.
              playsInline
              // Nijedan preglednik ne pušta snimak sam ako nije nijem. `muted`
              // ovdje nije ukras nego uslov da se sve ostalo desi.
              muted
              loop
              // Nema trake za premotavanje, nema dugmeta za sliku-u-slici, nema
              // ničega. `disablePictureInPicture` je tu jer Safari ponudi to
              // dugme i kad `controls` nema.
              disablePictureInPicture
              poster="/video/pogled-iz-zraka.jpg"
              src={src ?? undefined}
              preload="none"
              aria-label={t.video.describe}
              className="aspect-video w-full object-cover"
            />

            {needsTap && (
              <button
                type="button"
                onClick={start}
                className="group absolute inset-0 grid place-items-center bg-coal-950/25 transition-colors hover:bg-coal-950/10"
              >
                <span className="glass-dark flex items-center gap-3 rounded-full py-3 ps-5 pe-6 text-sm font-semibold text-cream-50 shadow-lift transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
                  <PlayIcon />
                  {t.video.play}
                </span>
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Trokut se ne okreće u arapskom — on pokazuje smjer vremena, ne smjer čitanja. */
function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.2v13.6a1 1 0 0 0 1.52.86l11.02-6.8a1 1 0 0 0 0-1.72L9.52 4.34A1 1 0 0 0 8 5.2Z" />
    </svg>
  );
}
