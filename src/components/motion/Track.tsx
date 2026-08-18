'use client';

import { useEffect, useRef } from 'react';

import { calmMotion, clamp, onScroll } from './ticker';

/**
 * Traka koja se kreće postrance dok se stranica skrola nadolje.
 *
 * Odjeljak je namjerno visok — tačno onoliko koliko traka viri izvan ekrana —
 * a njegov sadržaj je `position: sticky`, pa stranica naizgled stane dok traka
 * prolazi. Kad traka dođe do kraja, odjeljak se otpusti i stranica nastavi
 * dalje. Nema otetog skrola: prst i točkić rade tačno ono što inače rade, samo
 * se ono što se vidi kreće u drugom smjeru.
 *
 * Visina odjeljka se ne može napisati u CSS-u jer zavisi od širine sadržaja,
 * a ona od broja slika, ekrana i pisma — pa se mjeri i ponovo mjeri kad se
 * bilo šta od toga promijeni.
 *
 * Kad ovo NE radi — na uskom ekranu, bez JavaScripta, ili kad posjetilac u
 * sistemu ima "smanji animacije" — traka ostaje obična traka koja se prevlači
 * prstom, s hvatanjem na svaku sliku. Isti sadržaj, isti redoslijed, bez
 * ijedne slike koja se ne može dohvatiti.
 */
export function Track({
  children,
  overlay,
  className = '',
}: {
  children: React.ReactNode;
  /**
   * Sadržaj koji ostaje na ekranu dok traka prolazi — traka napretka, natpis,
   * broj slike. Stoji unutar zalijepljenog okvira, pa se ne pomjera s trakom.
   */
  overlay?: React.ReactNode;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outerNode = outer.current;
    const pinNode = pin.current;
    const railNode = rail.current;
    if (!outerNode || !pinNode || !railNode) return;

    // Na telefonu se sticky i adresna traka koja se skriva ne slažu — visina
    // ekrana se mijenja usred pokreta, pa traka poskakuje. Tamo je prevlačenje
    // prstom ionako prirodnije od skrolanja.
    const wide = window.matchMedia('(min-width: 768px)');

    let stop: (() => void) | null = null;
    let overflow = 0;

    const measure = () => {
      overflow = Math.max(railNode.scrollWidth - pinNode.clientWidth, 0);
      outerNode.style.height = `${pinNode.clientHeight + overflow}px`;
    };

    const move = () => {
      const box = outerNode.getBoundingClientRect();
      const travel = outerNode.offsetHeight - pinNode.clientHeight;
      const progress = travel > 0 ? clamp(-box.top / travel) : 0;

      // U arapskom traka teče zdesna nalijevo, pa i pomak ide na drugu stranu.
      const rtl = document.documentElement.dir === 'rtl';
      const shift = progress * overflow * (rtl ? 1 : -1);

      railNode.style.transform = `translate3d(${shift.toFixed(2)}px, 0, 0)`;
      // Napredak čita traka napretka u `overlay`-u, kroz CSS.
      outerNode.style.setProperty('--track-progress', progress.toFixed(3));
    };

    const enable = () => {
      if (stop) return;
      outerNode.dataset.pinned = 'true';
      measure();
      stop = onScroll(move);
    };

    const disable = () => {
      stop?.();
      stop = null;
      delete outerNode.dataset.pinned;
      outerNode.style.height = '';
      outerNode.style.removeProperty('--track-progress');
      railNode.style.transform = '';
    };

    const sync = () => {
      if (wide.matches && !calmMotion()) enable();
      else disable();
    };

    sync();
    wide.addEventListener('change', sync);

    // Slike stižu s odgodom i tek tada traka dobije svoju pravu širinu; bez
    // ponovnog mjerenja odjeljak bi ostao visok koliko je bio dok je bio prazan.
    const resize =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            if (!stop) return;
            measure();
            move();
          });
    resize?.observe(railNode);

    return () => {
      wide.removeEventListener('change', sync);
      resize?.disconnect();
      disable();
    };
  }, []);

  return (
    <div ref={outer} className={`track ${className}`}>
      <div ref={pin} className="track-pin">
        <div ref={rail} className="track-rail">
          {children}
        </div>
        {overlay}
      </div>
    </div>
  );
}
