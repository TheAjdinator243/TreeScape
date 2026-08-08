/**
 * Broj rezervacije — ono što gost pročita preko telefona.
 *
 * Pun `public_token` je dug i nasumičan; njime se otvara stranica s potvrdom i
 * on nikad ne ide naglas. Ovo je njegov početak, dovoljno kratak da se
 * izdiktira, a dovoljno dug da se dvije rezervacije ne poklope.
 *
 * Oblik stoji SAMO ovdje. Prije je isti izraz bio prepisan na tri mjesta — u
 * mailu, u Telegramu i na potvrdi — pa bi promjena dužine na jednom mjestu
 * značila da gost i domaćin gledaju dva različita broja i misle da je greška
 * kod onog drugog.
 */
export function bookingReference(publicToken: string): string {
  return publicToken.slice(0, REFERENCE_LENGTH).toUpperCase();
}

const REFERENCE_LENGTH = 8;
