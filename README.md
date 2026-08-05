# TreeScape

Web stranica za iznajmljivanje vile **TreeScape** — sa kalendarom slobodnih termina,
online rezervacijom i plaćanjem karticom ili gotovinom.

Kad neko plati, ti datumi **odmah** postanu sivi u kalendaru svih ostalih posjetilaca,
bez osvježavanja stranice.

---

## Sadržaj

- [Šta sve radi](#šta-sve-radi)
- [Prije nego počneš: Stripe i BiH](#prije-nego-počneš-stripe-i-bih)
- [Brzi start (5 minuta)](#brzi-start-5-minuta)
- [Podešavanje Supabase baze](#podešavanje-supabase-baze)
- [Podešavanje Stripe plaćanja](#podešavanje-stripe-plaćanja)
- [Objava na Vercel](#objava-na-vercel)
- [Zamjena fotografija](#zamjena-fotografija)
- [Administracija](#administracija)
- [Kako je spriječen dvostruki booking](#kako-je-spriječen-dvostruki-booking)
- [Testovi](#testovi)
- [Struktura projekta](#struktura-projekta)

---

## Šta sve radi

**Za goste**

- Jednostrana prezentacija: naslovna slika, galerija sa uvećavanjem, sadržaji, lokacija, česta pitanja
- Kalendar sa dva mjeseca — zauzeti datumi su prekriženi i ne mogu se kliknuti
- Cijena se računa uživo dok se biraju datumi, po sezonskom cjenovniku
- Plaćanje karticom (Stripe) ili zahtjev za plaćanje gotovinom
- Stranica s potvrdom i email obavijest
- Sve na bosanskom jeziku

**Za vlasnika** (`/admin`, iza tajnog koda)

- Odobravanje i odbijanje zahtjeva za plaćanje gotovinom
- Pregled svih rezervacija
- Ručno blokiranje termina (održavanje, lični boravak)
- Uređivanje osnovnih cijena i sezonskog cjenovnika

---

## Prije nego počneš: Stripe i BiH

> **Važno:** Stripe trenutno **ne otvara naloge firmama registrovanim u Bosni i
> Hercegovini.** Za stvarnu naplatu karticom potreban je Stripe nalog u nekoj od
> podržanih zemalja, ili prelazak na domaći procesor (Monri, PaySpot, banka).

To **ne blokira ništa** u razvoju:

- Cijeli sajt, kalendar, cijene i administracija rade bez ijednog Stripe ključa.
- Plaćanje karticom se u potpunosti testira Stripe **test modom**, koji je dostupan svima.
- Ako Stripe ključevi nisu postavljeni, dugme za karticu se **samo ne prikaže** —
  gosti i dalje mogu rezervisati uz plaćanje gotovinom.

Sav kod vezan za Stripe je u `src/lib/payments/`. Zamjena procesora znači prepisati
taj folder — kalendar, baza i sučelje ostaju netaknuti.

---

## Brzi start (5 minuta)

Treba ti [Node.js](https://nodejs.org) verzije 20 ili novije.

```bash
npm install
```

```bash
npm run dev
```

Otvori <http://localhost:3000>.

**Sajt radi odmah, bez ijednog naloga.** Dok Supabase nije podešen, kalendar koristi
demo podatke (nekoliko izmišljenih zauzetih termina) da možeš vidjeti kako sve
izgleda. Čim upišeš prave ključeve, demo podaci nestaju.

### Dvije komande koje ti pomažu

```bash
npm run setup
```

Pita te ključ po ključ i sam napiše `.env.local`. Tajne za administraciju i cron
generiše sam — dovoljno je pritisnuti Enter. Sve ostaje na tvom računaru.

```bash
npm run doctor
```

Provjeri da li je **sve** ispravno i javi tačno šta fali: da li je migracija
pokrenuta, da li Stripe ključ radi, da li je pristupni kod dovoljno jak. Najvažnije
— stvarno pokuša upisati dva preklapajuća termina u tvoju bazu i provjeri da ih
odbije, pa počisti za sobom. Nijedan ključ se ne ispisuje, samo maskirano, pa izlaz
te komande možeš slobodno nekome pokazati kad zatreba pomoć.

---

## Podešavanje Supabase baze

Supabase je besplatna hostovana Postgres baza. Ovdje čuva rezervacije i emituje
promjene uživo u sve otvorene preglednike.

**1.** Otvori nalog na [supabase.com](https://supabase.com) i napravi novi projekat.

**2.** U Supabase-u idi na **SQL Editor**, otvori novi upit, kopiraj **cijeli sadržaj**
datoteke [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
i pokreni ga. Time se prave sve tabele, sigurnosna pravila i zaštita od
dvostrukog bookinga.

**3.** Idi na **Project Settings → API** i prepiši tri vrijednosti u `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tvoj-projekat.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

> `SUPABASE_SERVICE_ROLE_KEY` je **tajni** ključ i koristi se samo na serveru.
> Nikada ga ne stavljaj u varijablu koja počinje sa `NEXT_PUBLIC_` — to bi ga
> poslalo u preglednik svakom posjetiocu.

**4.** Restartuj `npm run dev`.

### Zašto preglednik ne vidi podatke gostiju

Tabela `bookings` (imena, mailovi, telefoni) je zaključana pravilima pristupa —
`anon` ključ iz preglednika iz nje **ne može pročitati nijedan red**. Kalendar
umjesto toga čita tabelu `availability_slots`, u kojoj su samo datumi i ništa
drugo. Provjeriti možeš i sam: otvori konzolu preglednika i probaj upit nad
`bookings` — vratiće prazno.

---

## Podešavanje Stripe plaćanja

**1.** Otvori nalog na [stripe.com](https://stripe.com) (pročitaj napomenu o BiH gore).

**2.** **Developers → API keys** — prepiši test ključeve u `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...
```

**3.** Za lokalno testiranje webhooka instaliraj
[Stripe CLI](https://stripe.com/docs/stripe-cli), pa pokreni:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Komanda ispiše `whsec_...` — to upiši kao `STRIPE_WEBHOOK_SECRET` u `.env.local`
i restartuj `npm run dev`.

**4.** Testiraj plaćanje karticom **4242 4242 4242 4242**, bilo koji budući datum
isteka i bilo koji CVC.

> **Zašto je webhook obavezan:** rezervacija se potvrđuje **isključivo** kad Stripe
> pošalje potpisanu potvrdu o uplati — nikad na osnovu povratka gosta na stranicu.
> Adresu potvrde može otvoriti bilo ko; potpisani webhook ne može se lažirati.

---

## Objava na Vercel

**1.** Postavi projekat na GitHub:

```bash
git init && git add -A && git commit -m "TreeScape" && git branch -M main
```

Napravi prazan repozitorij na GitHub-u, pa:

```bash
git remote add origin https://github.com/KORISNIK/treescape.git && git push -u origin main
```

**2.** Na [vercel.com](https://vercel.com) klikni **Add New → Project** i odaberi taj
repozitorij. Vercel sam prepozna Next.js — ništa se ne mora mijenjati.

**3.** U **Settings → Environment Variables** dodaj sve iz `.env.example`, s tim da
`NEXT_PUBLIC_SITE_URL` bude prava adresa sajta (npr. `https://treescape.vercel.app`,
bez kose crte na kraju).

**4.** Kad se sajt objavi, u Stripe-u idi na **Developers → Webhooks → Add endpoint**:

- Adresa: `https://tvoj-sajt.vercel.app/api/stripe/webhook`
- Događaji: `checkout.session.completed`, `checkout.session.expired`,
  `checkout.session.async_payment_failed`

Stripe će prikazati novi `whsec_...` — upiši ga u Vercel kao `STRIPE_WEBHOOK_SECRET`
i ponovo objavi (redeploy).

**5.** Cron posao iz `vercel.json` se uključi sam. Svakih 10 minuta oslobađa termine
koje su gosti napustili na stranici za plaćanje.

---

## Zamjena fotografija

Trenutne slike su privremene, sa [Unsplash-a](https://unsplash.com/license)
(besplatne za komercijalnu upotrebu, bez obaveze potpisivanja autora).
**Obavezno ih zamijeni pravim slikama kuće prije objave.**

1. Ubaci svoje slike u `src/assets/gallery/`
2. Otvori [`src/lib/gallery.ts`](src/lib/gallery.ts) i prilagodi `import` linije na vrhu
3. Ispravi `alt` opise — njih čitaju Google i čitači ekrana za slijepe osobe

Next.js sam pravi WebP/AVIF verzije, računa dimenzije i prikazuje zamućeni pregled
dok se slika učitava. Ne treba ništa ručno smanjivati.

Kontakt podaci (telefon, email) su na dnu [`src/components/site/Footer.tsx`](src/components/site/Footer.tsx).
Koordinate karte su u [`src/components/site/Location.tsx`](src/components/site/Location.tsx).
Sav tekst sajta je na jednom mjestu: [`src/lib/strings.ts`](src/lib/strings.ts).

---

## Administracija

Otvori `/admin` (npr. `https://tvoj-sajt.vercel.app/admin`).

Nigdje na javnom sajtu **ne postoji link** ka administraciji, niti forma za
prijavu — samo polje za tajni kod, koji postavljaš kao `ADMIN_ACCESS_CODE`.

```bash
# Generiši dug, nasumičan kod i tajnu za potpisivanje sesije:
openssl rand -base64 24
openssl rand -base64 32
```

- `ADMIN_ACCESS_CODE` — kod koji vlasnik unosi
- `ADMIN_SESSION_SECRET` — najmanje 32 znaka, potpisuje kolačić sesije

Nakon unosa ispravnog koda sesija traje 12 sati. Kolačić je `httpOnly` (JavaScript
na stranici ne može do njega), kod se poredi u konstantnom vremenu, a nakon 5
pogrešnih pokušaja slijedi kratka pauza.

---

## Kako je spriječen dvostruki booking

Ovo je najvažniji dio cijelog sistema, pa zaslužuje objašnjenje.

Dvoje ljudi može istovremeno biti na Stripe stranici za isti termin. Provjera u
kodu tipa „je li slobodno?" pa onda upis **gubi tu utrku** — oba upita vide
slobodan termin prije nego iko upiše.

Zato odluku donosi sama baza:

```sql
constraint bookings_no_overlap
  exclude using gist (stay with &&)
  where (status in ('pending_payment', 'pending_cash', 'confirmed', 'blocked'))
```

Postgres fizički **ne dozvoljava** da dva reda koja se preklapaju istovremeno budu
aktivna. Drugi upis pada s greškom `23P01`, koju aplikacija hvata i pretvara u
poruku „ovi datumi su upravo rezervisani".

Uz to:

- **Termin se drži prije odlaska na Stripe**, ne poslije. Napušteno plaćanje se
  oslobodi nakon 15 minuta — i preko cron posla i pri svakom čitanju dostupnosti,
  pa zastoj crona ne može zaključati termin zauvijek.
- **Dan odlaska je slobodan.** Boravak 1.–5. avgusta je 4 noćenja, a 5. avgust je
  slobodan za sljedećeg gosta. To radi `daterange(start, end, '[)')`.
- **Zahtjev za gotovinu odmah zauzima termin**, da vlasnik ne odobri nešto što je
  u međuvremenu neko platio karticom.
- **Cijenu uvijek računa server**, iz baze. Iznos poslan iz preglednika se ignoriše.

Sve navedeno je pokriveno testovima.

---

## Testovi

```bash
npm test
```

60 testova, u dvije grupe:

- **`src/lib/pricing.test.ts`** — sezonske cijene, preklapanje sezona, minimalna
  noćenja, bosanska množina, granični slučajevi oko dana odlaska
- **`src/lib/schema.test.ts`** — pokreće `0001_init.sql` na **pravom Postgresu**
  (PGlite, Postgres preveden u WebAssembly) i provjerava da je dvostruki booking
  zaista nemoguć, da otkazivanje oslobađa termin, da okidač održava kalendar i da
  isteklo držanje termina propada kako treba

Za ovo ne treba nikakav nalog ni internet — pokreće se lokalno za par sekundi.

Ostale komande:

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm run build
```

---

## Struktura projekta

```
src/
├── app/
│   ├── page.tsx                  početna stranica
│   ├── layout.tsx                fontovi, meta podaci
│   ├── globals.css               dizajn sistem (boje, tipografija, kalendar)
│   ├── admin/                    administracija
│   ├── rezervacija/[token]/      stranica s potvrdom
│   └── api/
│       ├── availability/         javni spisak zauzetih datuma
│       ├── booking/hold          zaključavanje termina + Stripe sesija
│       ├── booking/cash          zahtjev za plaćanje gotovinom
│       ├── stripe/webhook        potvrda uplate (jedini izvor istine)
│       ├── admin/                zaštićene rute administracije
│       └── cron/expire-holds     oslobađanje napuštenih termina
├── components/
│   ├── site/                     naslovna, galerija, sadržaji, lokacija, pitanja
│   ├── booking/                  kalendar, cijena, forma za rezervaciju
│   └── admin/                    ulaz i nadzorna ploča
├── lib/
│   ├── pricing.ts                obračun cijene (isti kod na klijentu i serveru)
│   ├── dates.ts                  datumi kao 'YYYY-MM-DD' — bez pomaka zona
│   ├── booking-service.ts        pravljenje rezervacija, hvatanje sudara
│   ├── strings.ts                SAV tekst sajta
│   ├── gallery.ts                spisak fotografija
│   ├── payments/stripe.ts        sve što dodiruje Stripe
│   └── supabase/                 klijenti za preglednik i server
├── middleware.ts                 čuvar administracije
└── assets/gallery/               fotografije

supabase/migrations/0001_init.sql shema baze
```

---

## Napomene

- **Datumi** se svuda prenose kao `'YYYY-MM-DD'` stringovi. `new Date('2026-08-05')`
  JavaScript tumači kao ponoć po UTC-u, pa bi u Sarajevu ispalo 4. avgusta —
  za rezervacije neprihvatljivo.
- **Cijene** su u bazi u centima (`12000` = 120,00 €) da se izbjegne zaokruživanje
  decimalnih brojeva.
- **Valuta** je podrazumijevano EUR. Za konvertibilnu marku, u administraciji pod
  „Cijene" postavi valutu na `BAM` i oznaku na `KM`.
- **Podaci kartice nikada ne prolaze kroz ovaj sajt** — unose se na Stripe-ovoj
  stranici.
