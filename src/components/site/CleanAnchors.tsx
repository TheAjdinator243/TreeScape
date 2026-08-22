'use client';

import { useEffect } from 'react';

import { calmMotion } from '@/components/motion/ticker';

/**
 * Sidra koja ne pišu po adresnoj traci.
 *
 * Sve stavke u meniju, u podnožju i dugmad „Rezerviši" vode na odjeljke iste
 * stranice (`#rezervacija`, `#galerija`…). Preglednik na svaki takav klik upiše
 * sidro u adresu, pa umjesto `treescape.ba` u traci stoji
 * `treescape.ba/#rezervacija` — a to nikome ništa ne znači i ostane tu i kad
 * gost odskrola dalje.
 *
 * Ovdje se klik presreće i skrol se odradi ručno, pa adresa ostane čista.
 *
 * ── Zašto jedan osluškivač, a ne izmjena svakog linka ─────────────────────
 * Sidara ima jedanaest, na četiri mjesta. Da svako od njih dobije svoj `onClick`
 * značilo bi da se na jedanaest mjesta mora ne zaboraviti isto — a dvanaesto,
 * dodano za pola godine, sigurno bi se zaboravilo. Ovako pravilo važi za sve što
 * na stranici počinje s `#`, i za ono što tek dođe.
 *
 * ── Šta se moralo vratiti ručno ───────────────────────────────────────────
 * Kad preglednik sam odradi sidro, on i PREMJESTI ŽARIŠTE na odredište, pa
 * sljedeći `Tab` nastavi odatle. Sa `preventDefault()` to izostane, a bez toga
 * je link „preskoči na rezervaciju" — koji postoji isključivo zbog tastature —
 * potpuno besmislen: odveo bi pogled dolje, a tastaturu ostavio gore.
 *
 * Zato se žarište premješta ručno. Odjeljci nisu elementi koji ga inače primaju,
 * pa dobiju `tabindex="-1"` (fokusiraju se programski, ali ne ulaze u red za
 * `Tab`), a `preventScroll` sprječava da ih preglednik uz to još jednom trgne na
 * svoje mjesto.
 */
export function CleanAnchors() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Srednji klik, Ctrl+klik i sve ostalo što otvara u novoj kartici mora
      // ostati pregledniku — gost je tada tražio nešto drugo, ne skrol.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a');
      const href = link?.getAttribute('href');
      if (!link || !href || !href.startsWith('#') || href.length < 2) return;
      if (link.target && link.target !== '_self') return;

      const section = document.getElementById(href.slice(1));
      if (!section) return;

      event.preventDefault();

      section.scrollIntoView({
        behavior: calmMotion() ? 'auto' : 'smooth',
        block: 'start',
      });

      if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
