import { Lines } from '@/components/motion/Lines';
import { Reveal } from '@/components/motion/Reveal';

/**
 * Zaglavlje odjeljka — isto na cijeloj stranici.
 *
 * Redni broj, crta koja se izvuče, ime odjeljka, pa naslov koji se otkrije red
 * po red. Brojevi nisu ukras: gost po njima zna koliko je stranice ostalo, a
 * stranica po njima dobija ritam koji sam razmak između odjeljaka ne daje.
 *
 * Stoji kao zasebna komponenta, a ne kao skup klasa prepisanih po odjeljcima,
 * jer je ovo mjesto gdje se odlučuje kako cijeli sajt "govori". Kad se sutra
 * promijeni razmak ili veličina naslova, mijenja se ovdje — i to na svih šest
 * odjeljaka odjednom, a ne na pet od šest.
 */
export function SectionHead({
  index,
  label,
  title,
  lead,
  tone = 'light',
  className = '',
}: {
  /** Redni broj odjeljka na stranici. Ispisuje se kao 01, 02, 03… */
  index: number;
  label: string;
  title: string;
  lead?: string;
  /** `dark` je za odjeljke na tamnoj plohi — mijenja samo boje, ne raspored. */
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <Reveal className={`${tone === 'dark' ? 'head-dark' : ''} ${className}`}>
      <p className="head-tag">
        <span className="head-num">{String(index).padStart(2, '0')}</span>
        <span className="head-rule" aria-hidden="true" />
        {label}
      </p>

      <h2 className="head-title">
        <Lines text={title} delay={120} />
      </h2>

      {lead ? <p className="head-lead">{lead}</p> : null}
    </Reveal>
  );
}
