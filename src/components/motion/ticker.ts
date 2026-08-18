/**
 * Jedan `requestAnimationFrame` za cijelu stranicu.
 *
 * Svaki sloj koji se pomjera uz skrol (naslovna fotografija, slika uz tekst,
 * traka galerije, traka napretka u navigaciji) mogao bi imati svoj osluškivač
 * i svoj kadar. Onda bi ih na jednoj stranici bilo pet-šest, svaki bi zasebno
 * čitao poziciju skrola i time prisiljavao preglednik da iznova računa
 * raspored — pa bi se slojevi krivili jedan za drugim umjesto da se pomjere
 * zajedno.
 *
 * Ovako postoji JEDAN osluškivač skrola i JEDAN kadar. Kad kadar dođe, svi
 * poslovi se odrade zaredom i sve se pomjeri u istom trenutku.
 *
 * Kadar se ne vrti u prazno: zakazuje se samo kad se stvarno skrola ili mijenja
 * veličina prozora. Stranica koja mirno stoji ne troši ništa.
 */

type Job = () => void;

const jobs = new Set<Job>();
let scheduled = false;
let listening = false;

function run() {
  scheduled = false;
  for (const job of jobs) job();
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(run);
}

/**
 * Prijavi posao koji se odrađuje pri svakom pomjeranju stranice.
 *
 * Vraća funkciju za odjavu — komponenta je pozove kad nestane sa stranice.
 * Posao se jednom odradi odmah, prije prvog skrola: bez toga bi sloj do prvog
 * pomjeranja stajao na nuli umjesto na mjestu koje mu pripada.
 */
export function onScroll(job: Job): () => void {
  jobs.add(job);

  if (!listening) {
    listening = true;
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
  }

  job();

  return () => {
    jobs.delete(job);
    if (jobs.size === 0 && listening) {
      listening = false;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    }
  };
}

/**
 * Ima li posjetilac u sistemu uključeno "smanji animacije".
 *
 * CSS to poštuje sam (blok na dnu `globals.css`), ali pokret vezan za skrol
 * ne ide kroz CSS animacije nego kroz JavaScript, pa se mora pitati ovdje.
 * Takav posjetilac dobija istu stranicu, samo bez pomjeranja slojeva.
 */
export function calmMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Ograniči broj na raspon — koristi se za napredak od 0 do 1. */
export function clamp(value: number, min = 0, max = 1): number {
  return value < min ? min : value > max ? max : value;
}
