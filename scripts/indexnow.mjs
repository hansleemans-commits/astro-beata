#!/usr/bin/env node
// Dient alle URL's uit sitemap.xml in bij IndexNow (Bing, Yandex, Seznam, ...).
// Gebruik: npm run indexnow
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HOST = 'astro-beata.nl';
const KEY = 'f6a3351f402f71ae9845355cda91e902';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (urlList.length === 0) {
  console.error('Geen <loc>-URL\'s gevonden in sitemap.xml');
  process.exit(1);
}

console.log(`Indienen bij IndexNow (${urlList.length} URL's):`);
urlList.forEach((u) => console.log(`  - ${u}`));

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});

// IndexNow geeft 200 of 202 bij succes.
if (res.status === 200 || res.status === 202) {
  console.log(`\nGelukt — HTTP ${res.status}`);
} else {
  console.error(`\nMislukt — HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}
