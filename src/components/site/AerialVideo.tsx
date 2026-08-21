'use client';

import { useEffect, useRef, useState } from 'react';

import { useI18n } from '@/components/i18n/LocaleProvider';
import { Reveal } from '@/components/motion/Reveal';
import { calmMotion } from '@/components/motion/ticker';

import { SectionHead } from './SectionHead';

/**
 * Snimak imanja iz drona.
 *
 * ── Zašto se ne pušta uvijek sam ──────────────────────────────────────────
 * Snimak je 8 MB. Na širokom ekranu je to obično wi-fi i snimak koji krene sam
 * djeluje kao da je kuća živa; na telefonu je to nečiji paket podataka, potrošen
 * na nešto što nije ni tražio. Zato se sam pušta SAMO tamo gdje je to pošteno:
 * na ekranu od 1024px naviše, kad posjetilac nema uključeno "smanji animacije"
 * i kad preglednik ne javlja štednju podataka. Svugdje drugdje stoji slika s
 * dugmetom, pa snimak krene tek kad ga neko zaista zatraži.
 *
 * Zbog istog razloga `preload` nije uvijek isti: dok se ne zna hoće li se
 * snimak pustiti, ne skida se ni bajt.
 *
 * ── I kad se pušta sam, staje ─────────────────────────────────────────────
 * Video koji se vrti u kartici koju niko ne gleda troši i bateriju i podatke.
 * `IntersectionObserver` ga zaustavi čim izađe iz vidnog polja i vrati kad se
 * gost vrati na njega.
 */
export function AerialVideo() {
  const { t } = useI18n();
  const video = useRef<HTMLVideoElement>(null);

  /**
   * Pušta li se snimak sam.
   *
   * `null` znači "još se ne zna" — tako je i pri prvom iscrtavanju na serveru,
   * gdje ni širina ekrana ni postavke posjetioca nisu poznate. Dok je `null`,
   * ništa se ne skida.
   */
  const [ambient, setAmbient] = useState<boolean | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)');

    // `saveData` postoji samo u dijelu preglednika; gdje ga nema, `?? false`
    // znači "ne štedi", što je i tačno — nije nam rečeno suprotno.
    const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
    const thrifty = connection?.saveData ?? false;

    const decide = () => setAmbient(wide.matches && !calmMotion() && !thrifty);
    decide();
    wide.addEventListener('change', decide);
    return () => wide.removeEventListener('change', decide);
  }, []);

  useEffect(() => {
    const node = video.current;
    if (!node || ambient !== true || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // `play()` vraća obećanje koje odbije ako preglednik ipak ne dozvoli
          // automatsko puštanje. To nije greška u kodu nego njegova odluka, pa
          // se ne prijavljuje — samo ostane slika s dugmetom.
          void node.play().then(() => setStarted(true)).catch(() => setStarted(false));
        } else {
          node.pause();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ambient]);

  const start = () => {
    void video.current?.play().then(() => setStarted(true));
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
              // da ga pusti u kartici — a onda gost izgubi stranicu.
              playsInline
              muted
              loop
              poster="/video/pogled-iz-zraka.jpg"
              preload={ambient === true ? 'auto' : 'none'}
              controls={started && ambient !== true}
              aria-label={t.video.describe}
              className="aspect-video w-full object-cover"
            >
              <source src="/video/pogled-iz-zraka.mp4" type="video/mp4" />
            </video>

            {/*
              Dugme stoji preko slike sve dok snimak ne krene. Kad se pušta sam,
              nikad se i ne pojavi — `ambient` je tada `true`, a `started`
              postane `true` u istom trenutku.
            */}
            {!started && (
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
