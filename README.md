# TreeScape

Web stranica za iznajmljivanje vile **TreeScape** — sa kalendarom slobodnih
termina i online rezervacijom.

Čim neko rezerviše, ti datumi **odmah** postanu sivi u kalendaru svih ostalih
posjetilaca, bez osvježavanja stranice.

Sajt govori **bosanski, engleski i arapski** — uključujući i mailove koje gost
dobija.

---

## Sadržaj

- [Šta sve radi](#šta-sve-radi)
- [Brzi start](#brzi-start)
- [Jezici](#jezici)
- [Podešavanje Supabase baze](#podešavanje-supabase-baze)
- [Načini plaćanja](#načini-plaćanja)
- [Objava na Vercel](#objava-na-vercel)
- [Zamjena fotografija i teksta](#zamjena-fotografija-i-teksta)
- [Administracija](#administracija)
- [Kako je spriječen dvostruki booking](#kako-je-spriječen-dvostruki-booking)
- [Testovi](#testovi)
- [Struktura projekta](#struktura-projekta)

---

## Šta sve radi

**Za goste**

- Jednostrana prezentacija: naslovna slika, galerija sa uvećavanjem, sadržaji,
  lokacija, česta pitanja
- Kalendar sa dva mjeseca — zauzeti datumi su prekriženi i ne mogu se kliknuti
- **Rezervacija i za jedan jedini dan**, bez noćenja
- Cijena se računa uživo dok se biraju datumi, po sezonskom cjenovniku
- Stranica s potvrdom i email obavijest
- **Tri jezika** — bosanski, engleski i arapski, s ispravnim smjerom pisanja

**Za vlasnika** (`/admin`, iza tajnog koda)

- Odobravanje i odbijanje zahtjeva
- Potvrda primljenih uplata na račun
- Pregled svih rezervacija
- Ručno blokiranje termina (održavanje, lični boravak)
- Uređivanje cijena, sezonskog cjenovnika i bankovnih podataka
- Administracija govori isti jezik koji vlasnik odabere na sajtu

---

## Brzi start

Treba ti [Node.js](https://nodejs.org) verzije 20 ili novije.

```bash
npm install
```

```bash
npm run dev
```

Otvori <http://localhost:3000>.

**Sajt radi odmah, bez ijednog naloga.** Dok Supabase nije podešen, kalendar
koristi demo podatke da možeš vidjeti kako sve izgleda. Čim upišeš prave
ključeve, demo podaci nestaju.

### Dvije komande koje ti pomažu

```bash
npm run setup
```

Pita te ključ po ključ i sam napiše `.env.local`. Tajne za administraciju i cron
generiše sam — dovoljno je pritisnuti Enter. Sve ostaje na tvom računaru.

```bash
npm run doctor
```

Provjeri da li je **sve** ispravno i javi tačno šta fali. Najvažnije — stvarno
pokuša upisati dva preklapajuća termina u tvoju bazu i provjeri da ih odbije, pa
počisti za sobom. Nijedan ključ se ne ispisuje, samo maskirano, pa izlaz te
komande možeš slobodno nekome pokazati kad zatreba pomoć.

---

## Jezici

Sajt govori tri jezika:

| Jezik | Oznaka | Smjer |
|---|---|---|
| Bosanski | `bs` | slijeva nadesno |
| English | `en` | slijeva nadesno |
| العربية (arapski) | `ar` | **zdesna nalijevo** |

**Kako se bira.** Gost bira jezik u navigaciji ili u podnožju. Izbor se pamti u
kolačiću `treescape_jezik` godinu dana. Ko još nije birao, dobija jezik svog
preglednika (`Accept-Language`); ako sajt taj jezik ne govori — bosanski.

Izričit izbor uvijek pobjeđuje preglednik. Ko je jednom kliknuo „English", ne
želi da mu se sajt vrati na bosanski samo zato što mu je Windows na tom jeziku.

**Šta se sve prevodi.** Cijela stranica, administracija, poruke o greškama iz
API-ja i mailovi. Jezik na kojem je gost rezervisao upisuje se uz rezervaciju
(kolona `bookings.locale`, migracija 0003) — jer potvrda ili odbijanje zahtjeva
za gotovinu stižu danima kasnije, iz administracije, kad od gosta više nema ni
kolačića ni zaglavlja. Mailovi vlasniku idu na bosanskom, ali nose podatak o
tome kojim jezikom gost govori.

**Arapski.** Cijela stranica se okreće preko `dir="rtl"` na `<html>`; komponente
nigdje ne provjeravaju koji je jezik u pitanju, nego koriste logičke Tailwind
klase (`ms-`, `pe-`, `text-start`), koje se same okrenu. Za arapsko pismo se
učitava Noto Sans Arabic, a razmicanje slova i velika slova se isključuju — u
arapskom prvo lomi riječi, a drugo ne postoji. Cifre ostaju latinične, da iznos
od 345 KM i datum 5.8.2026. ne budu pisani dvjema vrstama cifara na istom
ekranu.

**Jedna adresa, ne tri.** Jezik se bira kolačićem, pa sve tri verzije žive na
istoj adresi — nema `/en/` ni `/ar/`. Za goste je to najjednostavnije: link
podijeljen na WhatsAppu radi svakome na njegovom jeziku.

Cijena toga je SEO: Google indeksira samo bosansku verziju, jer njegov robot
nema kolačić. Ako jednog dana bude važno da se sajt nalazi i po arapskim
upitima, jezici moraju dobiti svoje adrese (`/en`, `/ar`) i `hreflang` oznake.
Rječnici i sve ostalo ovdje ostaju isti — mijenja se samo gdje se jezik čita.

**Kako dodati četvrti jezik.**

1. Dodaj oznaku u `LOCALES` i smjer u `DIRECTIONS`
   ([`src/lib/i18n/config.ts`](src/lib/i18n/config.ts))
2. Napravi `src/lib/i18n/dictionaries/<oznaka>.ts` po uzoru na `bs.ts`
3. Upiši ga u `DICTIONARIES` ([`src/lib/i18n/index.ts`](src/lib/i18n/index.ts))
4. Dodaj oblike množine u `plural` ([`src/lib/i18n/plural.ts`](src/lib/i18n/plural.ts))
   i obrasce datuma u `PATTERNS` ([`src/lib/dates.ts`](src/lib/dates.ts))
5. Proširi `bookings_locale_check` novom migracijom

Ako nešto zaboraviš, TypeScript prijavi grešku prije nego što se sajt uopće
pokrene — tip `Dictionary` traži svaki ključ.

---

## Podešavanje Supabase baze

Supabase je besplatna hostovana Postgres baza. Ovdje čuva rezervacije i emituje
promjene uživo u sve otvorene preglednike.

**1.** Otvori nalog na [supabase.com](https://supabase.com) i napravi novi projekat.

**2.** U Supabase-u idi na **SQL Editor** i pokreni **sve** migracije, redom:

1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
2. [`supabase/migrations/0002_bez_stripea.sql`](supabase/migrations/0002_bez_stripea.sql)
3. [`supabase/migrations/0003_jezik_gosta.sql`](supabase/migrations/0003_jezik_gosta.sql)

Kopiraj cijeli sadržaj datoteke, zalijepi i klikni **Run**. Očekivani odgovor je
_"Success. No rows returned"_ — to je uspjeh, migracije ne vraćaju redove.

**3.** Idi na **Project Settings → API** i prepiši tri vrijednosti u `.env.local`
(ili pokreni `npm run setup`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tvoj-projekat.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

> `SUPABASE_SERVICE_ROLE_KEY` je **tajni** ključ i koristi se samo na serveru.
> Nikada ga ne stavljaj u varijablu koja počinje sa `NEXT_PUBLIC_` — to bi ga
> poslalo u preglednik svakom posjetiocu.

**4.** Restartuj `npm run dev`, pa pokreni `npm run doctor` da potvrdiš da je sve na mjestu.

### Zašto preglednik ne vidi podatke gostiju

Tabela `bookings` (imena, mailovi, telefoni) je zaključana pravilima pristupa —
`anon` ključ iz preglednika iz nje **ne može pročitati nijedan red**. Kalendar
umjesto toga čita tabelu `availability_slots`, u kojoj su samo datumi i ništa
drugo. `npm run doctor` to provjerava svaki put.

---

## Načini plaćanja

Svi načini žive u [`src/lib/payments/`](src/lib/payments/index.ts). Ostatak
aplikacije ne poznaje nijednog konkretnog procesora.

| Način | Kako radi | Šta traži |
|---|---|---|
| **Gotovina** | Gost pošalje zahtjev, vlasnik ga odobri. Termin se drži dok vlasnik ne odluči. | ništa |
| **Uplata na račun** | Gost dobije IBAN, iznos i poziv na broj. Novac ide **direktno** vlasniku, bez posrednika i provizije. Termin se drži zadanim brojem dana; vlasnik potvrdi uplatu kad je vidi na izvodu. | IBAN unesen u `/admin → Cijene` |
| **TEST** | Odmah potvrdi rezervaciju, bez ijednog centa. Služi samo za isprobavanje toka. | `ENABLE_TEST_PAYMENTS=true` |

> **TEST način na pravom sajtu znači besplatne rezervacije za svakoga.**
> Zato `npm run doctor` javlja **grešku** (ne upozorenje) ako je uključen uz
> adresu koja nije `localhost`.

Poziv na broj se izvodi iz tokena rezervacije, pa je jedinstven za svakog gosta —
po njemu vlasnik na bankovnom izvodu prepoznaje ko je uplatio.

### Naplata karticom preko banke

Naplata karticom u BiH traži potpisan ugovor s bankom ili procesorom (Monri,
WSPay, PaySpot); pristupne podatke dobiješ tek nakon toga. Kad ih dobiješ, dodaje
se **jedan unos** u `src/lib/payments/index.ts` i jedna datoteka pored njega.
Baza, kalendar i administracija se ne diraju.

Rezervacija tada ostaje u stanju „rezervisano" dok se uplata ne provjeri, isto
kao i sada — zato taj korak i ne traži izmjene drugdje.

---

## Objava na Vercel

**1.** Postavi projekat na GitHub:

```bash
git init && git add -A && git commit -m "TreeScape" && git branch -M main
```

```bash
git remote add origin https://github.com/KORISNIK/treescape.git && git push -u origin main
```

**2.** Na [vercel.com](https://vercel.com) klikni **Add New → Project** i odaberi
taj repozitorij. Vercel sam prepozna Next.js — Root Directory ostaje `./`.

**3.** U **Environment Variables** dodaj sve iz `.env.example`, s tim da:

- `NEXT_PUBLIC_SITE_URL` bude prava adresa sajta, **bez kose crte na kraju**
- `ENABLE_TEST_PAYMENTS` bude **`false`**

**4.** Cron posao iz `vercel.json` se uključi sam. Jednom dnevno oslobađa termine
kojima je istekao rok za uplatu.

> Zašto samo jednom dnevno: cron je rezervna mreža, ne glavna odbrana. Iste
> termine oslobađa i svako učitavanje kalendara i svaka nova rezervacija, pa
> zastoj crona ne može zaključati termin. Besplatni Vercel plan ionako dozvoljava
> samo dnevni cron.

Od tada Vercel objavljuje svaku izmjenu automatski, čim je pošalješ na GitHub.

---

## Zamjena fotografija i teksta

Sve slike su trenutno prazni okviri s natpisom **SLIKA 1 … SLIKA 14**.

1. Nazovi svoju sliku isto kao onu koju mijenjaš — npr. `slika-01.jpg`
2. Prebaci je u `src/assets/gallery/` i prepiši postojeću
3. U rječnicima (`src/lib/i18n/dictionaries/`) promijeni `gallery.itemAlt` i
   `gallery.itemCaption` da opisuju šta se stvarno vidi — na sva tri jezika

**SLIKA 1** je naslovna, preko cijelog ekrana — neka bude široka i najljepša.
**SLIKA 3** i **SLIKA 6** su uspravne, ostale položene.

Next.js sam pravi WebP/AVIF verzije, računa dimenzije i prikazuje zamućeni
pregled dok se slika učitava. Ne treba ništa ručno smanjivati.

`alt` je opis za slijepe osobe i za Google — nikad ga ne ostavljaj prazan i
nemoj u njega pisati „slika", nego šta se na slici vidi.

**Ostalo što treba zamijeniti prije nego pustiš link gostima:**

| Šta | Gdje |
|---|---|
| Sav tekst sajta, na sva tri jezika | [`src/lib/i18n/dictionaries/`](src/lib/i18n/dictionaries/) |
| Telefon i email | [`src/components/site/Footer.tsx`](src/components/site/Footer.tsx) |
| Koordinate karte | [`src/components/site/Location.tsx`](src/components/site/Location.tsx) |
| Koji sadržaji se prikazuju i kojim redom | [`src/components/site/Amenities.tsx`](src/components/site/Amenities.tsx) |
| Minuti vožnje do okoline | [`src/components/site/Location.tsx`](src/components/site/Location.tsx) |

Nazivi sadržaja, pitanja i odgovori i sve ostale riječi stoje u rječnicima —
komponente drže samo ono što ne zavisi od jezika (ikone, redoslijed, brojeve).

---

## Administracija

Otvori `/admin`. Nigdje na javnom sajtu **ne postoji link** ka administraciji,
niti forma za prijavu — samo polje za tajni kod.

```bash
openssl rand -base64 24   # ADMIN_ACCESS_CODE
openssl rand -base64 32   # ADMIN_SESSION_SECRET
```

- `ADMIN_ACCESS_CODE` — kod koji vlasnik unosi
- `ADMIN_SESSION_SECRET` — najmanje 32 znaka, potpisuje kolačić sesije

Sesija traje 12 sati. Kolačić je `httpOnly` (JavaScript na stranici ne može do
njega), kod se poredi u konstantnom vremenu, a nakon 5 pogrešnih pokušaja slijedi
kratka pauza.

> `npm run doctor` odbija kodove koji su primjeri iz uputstva i upozorava na
> kodove oblika „Ime1234" — takve pogađa svako ko te poznaje.

---

## Kako je spriječen dvostruki booking

Ovo je najvažniji dio sistema.

Dvoje ljudi može istovremeno rezervisati isti termin. Provjera u kodu tipa „je li
slobodno?" pa onda upis **gubi tu utrku** — oba upita vide slobodan termin prije
nego iko upiše.

Zato odluku donosi sama baza:

```sql
constraint bookings_no_overlap
  exclude using gist (stay with &&)
  where (status in ('pending_payment', 'pending_cash', 'pending_transfer',
                    'confirmed', 'blocked'))
```

Postgres fizički **ne dozvoljava** da dva reda koja se preklapaju istovremeno
budu aktivna. Drugi upis pada s greškom `23P01`, koju aplikacija hvata i pretvara
u poruku „ovi datumi su upravo rezervisani".

Uz to:

- **Termin se drži od trenutka rezervacije**, ne od potvrde. Neplaćena uplata na
  račun se oslobodi nakon isteka roka — i preko cron posla i pri svakom čitanju
  dostupnosti, pa zastoj crona ne može zaključati termin zauvijek.
- **Dan odlaska je slobodan.** Boravak 1.–5. avgusta zauzima 4 dana, a 5. avgust
  je slobodan sljedećem gostu. To se poklapa s odjavom u 09:00 i prijavom u 11:00
  istog dana, a u bazi to radi `daterange(start, end, '[)')`.
- **Jedan dan bez noćenja** se upisuje kao `[dan, dan+1)`, pa taj dan stvarno
  bude zauzet i isto ograničenje radi nepromijenjeno.
- **Cijenu uvijek računa server**, iz baze. Iznos poslan iz preglednika se ignoriše.

Sve navedeno je pokriveno testovima.

---

## Testovi

```bash
npm test
```

90 testova, u tri grupe:

- **`src/lib/pricing.test.ts`** — sezonske cijene, preklapanje sezona, rezervacija
  jednog dana, granični slučajevi oko dana odlaska
- **`src/lib/i18n/i18n.test.ts`** — prepoznavanje jezika iz kolačića i zaglavlja,
  množina na sva tri jezika (uključujući arapsku dvojinu), obrasci datuma i novca,
  i provjera da nijedan prevod nije ostao prazan
- **`src/lib/schema.test.ts`** — pokreće sve migracije na **pravom Postgresu**
  (PGlite, Postgres preveden u WebAssembly) i provjerava da je dvostruki booking
  zaista nemoguć, da otkazivanje oslobađa termin, da okidač održava kalendar i da
  isteklo držanje termina propada kako treba

Za ovo ne treba nikakav nalog ni internet — pokreće se lokalno za par sekundi.

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
│       ├── booking/reserve       rezervacija (svi načini plaćanja)
│       ├── admin/                zaštićene rute administracije
│       └── cron/expire-holds     oslobađanje termina s isteklim rokom
├── components/
│   ├── site/                     naslovna, galerija, sadržaji, lokacija, pitanja
│   ├── booking/                  kalendar, cijena, forma, podaci za uplatu
│   ├── i18n/                     birač jezika i rječnik za klijentske komponente
│   └── admin/                    ulaz i nadzorna ploča
├── lib/
│   ├── pricing.ts                obračun cijene (isti kod na klijentu i serveru)
│   ├── dates.ts                  datumi kao 'YYYY-MM-DD' — bez pomaka zona
│   ├── booking-service.ts        pravljenje rezervacija, hvatanje sudara
│   ├── payments/                 načini plaćanja
│   ├── i18n/                     jezici: rječnici, množina, prepoznavanje
│   ├── gallery.ts                spisak fotografija
│   └── supabase/                 klijenti za preglednik i server
├── proxy.ts                      čuvar administracije
└── assets/gallery/               fotografije

supabase/migrations/              shema baze — pokreni sve, redom
scripts/                          npm run setup i npm run doctor
```

---

## Napomene

- **Datumi** se svuda prenose kao `'YYYY-MM-DD'` stringovi. `new Date('2026-08-05')`
  JavaScript tumači kao ponoć po UTC-u, pa bi u Sarajevu ispalo 4. avgusta —
  za rezervacije neprihvatljivo.
- **Cijene** su u bazi u centima (`25000` = 250,00 KM) da se izbjegne
  zaokruživanje decimalnih brojeva.
- **Jedinica je dan, ne noćenje** — jer se kuća može uzeti i samo za jedan dan.
- **Valuta** se mijenja u administraciji pod „Cijene".
