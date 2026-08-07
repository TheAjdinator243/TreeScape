/**
 * Gdje je kuća — jedno mjesto za cijeli sajt.
 *
 * Koordinate stoje ovdje, a ne u komponenti, jer ih čitaju i karta i link na
 * Google Mape, i to u oba izgleda sajta (osnovnom i `pro`). Da su prepisane po
 * komponentama, prva izmjena bi ostavila ostale da pokazuju staru adresu —
 * a gost bi to otkrio tek kad se izgubi.
 *
 * Mijenjaj SAMO ovdje.
 */
export const MAP_MARKER = { lat: 43.92036062376055, lon: 18.281697249204257 };

/** Koliko se karte vidi oko oznake. Manji broj = više uvećano. */
const DELTA = 0.03;

const MAP_BBOX = [
  MAP_MARKER.lon - DELTA,
  MAP_MARKER.lat - DELTA / 2,
  MAP_MARKER.lon + DELTA,
  MAP_MARKER.lat + DELTA / 2,
].join(',');

/**
 * Karta je OpenStreetMap iframe — radi bez API ključa i bez naplate.
 * (Google Maps Embed traži ključ i naplaćuje se preko besplatne kvote.)
 */
export const MAP_SRC =
  `https://www.openstreetmap.org/export/embed.html?bbox=${MAP_BBOX}` +
  `&layer=mapnik&marker=${MAP_MARKER.lat},${MAP_MARKER.lon}`;

/**
 * Zvanični oblik Google linka (`?api=1`) — jedini koji Google obećava da neće
 * mijenjati. Na mobitelu ga preuzme aplikacija Mapa, na računaru se otvori u
 * pregledniku. Ne treba ključ.
 */
export const GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${MAP_MARKER.lat}%2C${MAP_MARKER.lon}`;

/** Minute vožnje su činjenica o kući, pa stoje ovdje; nazivi su u rječnicima. */
export const TRAVEL = [
  { key: 'city', minutes: 35 },
  { key: 'airport', minutes: 45 },
  { key: 'shop', minutes: 8 },
  { key: 'ski', minutes: 25 },
] as const;
