import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      /**
       * `server-only` je paket koji NAMJERNO baca grešku pri uvozu — tako Next
       * spriječi da serverski modul završi u pregledniku. Next mu pri gradnji
       * servera podmetne praznu verziju; vitest to ne zna, pa bi svaki test
       * serverskog modula pukao već na prvoj liniji. Ovdje radimo isto što i
       * Next: uvozimo praznu verziju iz istog paketa.
       */
      'server-only': path.resolve(import.meta.dirname, './node_modules/server-only/empty.js'),
    },
  },
});
