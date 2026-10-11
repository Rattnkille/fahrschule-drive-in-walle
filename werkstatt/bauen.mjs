#!/usr/bin/env node
// Baut aus einer Kundendatei (kunden/<name>.json) eine fertige Website samt ZIP.
// Aufruf: node werkstatt/bauen.mjs werkstatt/kunden/drive-in-walle.json
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const vorlage = join(here, 'vorlage');
const datei = process.argv[2];
if (!datei) {
  console.error('Aufruf: node werkstatt/bauen.mjs werkstatt/kunden/<kunde>.json');
  process.exit(1);
}
const daten = JSON.parse(readFileSync(datei, 'utf8'));
const slug = basename(datei, '.json');
const ziel = join(here, 'ausgabe', slug);

// Icons für Zielgruppen und Kontakt
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${d}</svg>`;
const ICONS = {
  schule: svg('<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>'),
  job: svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  herz: svg('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>'),
  schild: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>'),
  stern: svg('<path d="m12 2 3 7 7 .6-5.3 4.6L18.3 21 12 17.3 5.7 21l1.6-6.8L2 9.6 9 9z"/>'),
  berg: svg('<path d="m3 20 6-11 4 7 3-4 5 8Z"/>'),
  wind: svg('<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h7"/>'),
  menschen: svg('<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5A5 5 0 0 1 21 20"/>'),
};
const extra = {
  icon_telefon: svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
  icon_whatsapp: svg('<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.6A8.5 8.5 0 1 1 21 11.5Z"/>'),
  icon_mail: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>'),
  icon_karte: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
};

// Abgeleitete Werte
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const logo = daten.logo.map((t) => (t.farbe ? `<span style="color:${t.farbe === 'primaer' ? 'var(--blue)' : 'var(--orange)'}">${esc(t.text)}</span>` : esc(t.text))).join(' ');
daten.zielgruppen.liste.forEach((z) => { z.icon = ICONS[z.icon] || ICONS.stern; });
daten.leistungen.liste.forEach((l, i) => { l.nr = String(i + 1).padStart(2, '0'); });
daten.ablauf.schritte.forEach((s, i) => { s.nr = i + 1; });
const schema = {
  '@context': 'https://schema.org',
  '@type': daten.schema_typ || 'LocalBusiness',
  name: daten.name,
  url: `${daten.domain}/`,
  telephone: daten.kontakt.telefon_link,
  ...(daten.kontakt.email && { email: daten.kontakt.email }),
  areaServed: daten.ort,
  address: { '@type': 'PostalAddress', addressLocality: daten.stadt, addressCountry: 'DE' },
};
const ctx = { ...daten, ...extra, logo_html: logo, schema_json: JSON.stringify(schema).replace(/</g, '\\u003c') };

// Mini-Template: {{x}} escaped, {{{x}}} roh, {{#x}}…{{/x}} für Listen und Bedingungen, {{.}} aktuelles Element
const get = (obj, path) => (path === '.' ? obj : path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj));
function render(tpl, scope, root = scope) {
  tpl = tpl.replace(/\{\{#([\w.]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, inner) => {
    const v = get(scope, key) ?? get(root, key);
    if (!v || (Array.isArray(v) && !v.length)) return '';
    if (Array.isArray(v)) return v.map((item) => (typeof item === 'object' ? render(inner, item, root) : render(inner.replace(/\{\{\.\}\}/g, esc(item)), scope, root))).join('');
    return render(inner, scope, root);
  });
  tpl = tpl.replace(/\{\{\{([\w.]+)\}\}\}/g, (_, k) => get(scope, k) ?? get(root, k) ?? '');
  return tpl.replace(/\{\{([\w.]+)\}\}/g, (m, k) => {
    const v = get(scope, k) ?? get(root, k);
    if (v === undefined) throw new Error(`Fehlender Wert in ${datei}: ${k}`);
    return esc(v);
  });
}

// Ausgabe schreiben
rmSync(ziel, { recursive: true, force: true });
mkdirSync(join(ziel, 'bilder'), { recursive: true });
for (const f of ['index.html', 'impressum.html', 'datenschutz.html', '404.html']) {
  writeFileSync(join(ziel, f), render(readFileSync(join(vorlage, f), 'utf8'), ctx));
}
cpSync(join(vorlage, 'styles.css'), join(ziel, 'styles.css'));
cpSync(join(vorlage, 'script.js'), join(ziel, 'script.js'));
cpSync(join(vorlage, 'fonts'), join(ziel, 'fonts'), { recursive: true });
const host = new URL(daten.domain).host;
writeFileSync(join(ziel, '.htaccess'), readFileSync(join(vorlage, 'htaccess.txt'), 'utf8').replaceAll('www.driveinwalle.de', host).replace('^www\\.', `^${host.replace(/\./g, '\\.')}$`));
writeFileSync(join(ziel, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${daten.domain}/sitemap.xml\n`);
writeFileSync(join(ziel, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${daten.domain}/</loc></url>\n</urlset>\n`);
writeFileSync(join(ziel, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#14171C"/><circle cx="32" cy="32" r="17" fill="none" stroke="${daten.farben.akzent}" stroke-width="8"/><path d="M14 50 C 26 40, 38 40, 50 50" fill="none" stroke="${daten.farben.primaer}" stroke-width="5" stroke-linecap="round"/></svg>\n`);
writeFileSync(join(ziel, 'bilder', 'LIESMICH.txt'), 'hero.jpg (16:9, ca. 2000 px) und standort.jpg (Querformat, ca. 1600 px) hier ablegen.\nFehlt ein Foto, zeigt die Seite automatisch eine Grafik.\n');
for (const bild of ['hero.jpg', 'standort.jpg']) {
  const quelle = join(dirname(datei), slug, bild);
  if (existsSync(quelle)) cpSync(quelle, join(ziel, 'bilder', bild));
}

// Offene Punkte melden
const offen = JSON.stringify(daten).match(/\[[A-ZÄÖÜ][^\]]*\]/g) || [];
console.log(`Fertig: ${ziel}`);
if (offen.length) console.log(`Noch offen (${offen.length}):\n  ${[...new Set(offen)].join('\n  ')}`);

try {
  execFileSync('zip', ['-qr', `../${slug}.zip`, '.'], { cwd: ziel });
  console.log(`ZIP: ${join(here, 'ausgabe', slug + '.zip')}`);
} catch {
  console.log('Hinweis: "zip" nicht gefunden, ZIP bitte manuell erstellen.');
}
