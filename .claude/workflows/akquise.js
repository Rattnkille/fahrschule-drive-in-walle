export const meta = {
  name: 'akquise',
  description: 'Findet Betriebe über Google Maps, prüft ihre Websites, baut Demo-Seiten und schreibt Anschreiben zur Freigabe',
  whenToUse: 'Neue Akquise-Runde für eine Branche und einen Ort, z. B. Fahrschulen in Bremen',
  phases: [
    { title: 'Suchen', detail: 'Google Maps Scraper oder CSV' },
    { title: 'Prüfen', detail: 'Website-Check pro Betrieb (günstiges Modell)' },
    { title: 'Bauen', detail: 'Kundendatei + Demo-Website pro Kandidat' },
    { title: 'Kontrolle', detail: 'Unabhängige Prüfung jeder Demo' },
    { title: 'Anschreiben', detail: 'Brief, Telefonleitfaden, E-Mail-Entwurf' },
    { title: 'Übersicht', detail: 'Freigabeliste für den Inhaber' },
  ],
}

// Aufruf-Parameter (args):
// { suche: "Fahrschule", ort: "Bremen", datum: "2026-10-11", max_demos: 5,
//   csv: "optional/pfad/leads.csv", scraper_pfad: "optional",
//   absender: { name, telefon, email, web }, angebot: "z. B. 990 € oder Tausch gegen Motorradführerschein" }
const a = args || {}
if (!a.suche || !a.ort || !a.datum) throw new Error('args braucht mindestens suche, ort und datum (JJJJ-MM-TT)')
const MAX = a.max_demos || 5
const ordner = `akquise/${a.datum}-${a.suche}-${a.ort}`.toLowerCase().replace(/[^a-z0-9/-]+/g, '-')

const LEADS = {
  type: 'object',
  properties: {
    leads: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' }, adresse: { type: 'string' }, telefon: { type: 'string' },
          website: { type: 'string' }, maps_link: { type: 'string' }, bewertung: { type: 'number' },
          anzahl_bewertungen: { type: 'number' }, kategorie: { type: 'string' },
        },
        required: ['name'],
      },
    },
    fehler: { type: 'string' },
  },
  required: ['leads'],
}
const PRUEFUNG = {
  type: 'object',
  properties: {
    kategorie: { type: 'string', enum: ['keine_website', 'veraltet', 'schlecht', 'gut'] },
    maengel_summe: { type: 'number' },
    lohnt_sich: { type: 'boolean' },
    gruende: { type: 'array', items: { type: 'string' } },
    infos: { type: 'string' },
  },
  required: ['kategorie', 'lohnt_sich', 'gruende'],
}
const DEMO = {
  type: 'object',
  properties: {
    slug: { type: 'string' }, kundendatei: { type: 'string' }, ausgabe: { type: 'string' },
    vorschau: { type: 'string' }, offene_punkte: { type: 'array', items: { type: 'string' } },
    ok: { type: 'boolean' }, problem: { type: 'string' },
  },
  required: ['slug', 'ok'],
}
const KONTROLLE = {
  type: 'object',
  properties: {
    freigabe: { type: 'boolean' },
    probleme: { type: 'array', items: { type: 'string' } },
  },
  required: ['freigabe', 'probleme'],
}

// 1. Suchen
phase('Suchen')
const gefunden = await agent(
  `Sammle Leads: Suchbegriff "${a.suche}", Ort "${a.ort}". ` +
  (a.csv ? `Nutze die vorhandene CSV: ${a.csv}. ` : `Nutze den lokalen Google Maps Scraper${a.scraper_pfad ? ` unter ${a.scraper_pfad}` : ''}. `) +
  `Speichere die bereinigte Liste unter ${ordner}/leads.csv und gib alle Leads zurück.`,
  { agentType: 'lead-scout', schema: LEADS, label: 'Leads sammeln' },
)
if (!gefunden || !gefunden.leads.length) {
  log(`Keine Leads gefunden. ${gefunden && gefunden.fehler ? gefunden.fehler : ''}`)
  return { leads: 0, ordner }
}
log(`${gefunden.leads.length} Betriebe gefunden`)

// 2. Prüfen (alle, günstig) – Barriere, weil danach die besten Kandidaten ausgewählt werden
phase('Prüfen')
const geprueft = (await parallel(gefunden.leads.map((lead, i) => () =>
  agent(
    `Prüfe die Website dieses Betriebs: ${JSON.stringify(lead)}. ` +
    (lead.website ? `Website: ${lead.website}` : 'Es ist keine Website hinterlegt, prüfe kurz per Websuche, ob es doch eine eigene gibt.'),
    { agentType: 'website-pruefer', schema: PRUEFUNG, phase: 'Prüfen', label: `Prüfen: ${lead.name}`, effort: 'low' },
  ).then((p) => (p ? { lead, pruefung: p, i } : null)),
))).filter(Boolean)

const rang = { keine_website: 3, veraltet: 2, schlecht: 1, gut: 0 }
const kandidaten = geprueft
  .filter((g) => g.pruefung.lohnt_sich)
  .sort((x, y) => (rang[y.pruefung.kategorie] - rang[x.pruefung.kategorie])
    || ((y.pruefung.maengel_summe || 0) - (x.pruefung.maengel_summe || 0))
    || ((y.lead.anzahl_bewertungen || 0) - (x.lead.anzahl_bewertungen || 0)))
const auswahl = kandidaten.slice(0, MAX)
log(`${kandidaten.length} lohnende Kandidaten, ${auswahl.length} bekommen eine Demo`)
if (kandidaten.length > auswahl.length) log(`Nicht gebaut (Limit ${MAX}): ${kandidaten.slice(MAX).map((k) => k.lead.name).join(', ')}`)

// 3.–5. Pro Kandidat: Bauen → Kontrolle (mit einer Reparaturrunde) → Anschreiben
const ergebnisse = await pipeline(
  auswahl,
  (k) => agent(
    `Baue eine Demo-Website für diesen Betrieb.\nMaps-Daten: ${JSON.stringify(k.lead)}\n` +
    `Website-Prüfung: ${JSON.stringify(k.pruefung)}\nBranche: ${a.suche}`,
    { agentType: 'demo-bauer', schema: DEMO, phase: 'Bauen', label: `Bauen: ${k.lead.name}` },
  ),
  async (demo, k) => {
    if (!demo || !demo.ok) return { k, demo, kontrolle: { freigabe: false, probleme: [demo ? demo.problem : 'Bau fehlgeschlagen'] } }
    const pruefe = () => agent(
      `Kontrolliere die Demo unter ${demo.ausgabe} kritisch, als wärst du der Inhaber von "${k.lead.name}". ` +
      `Öffne index.html mit Playwright (1440 px und 390 px). Prüfe: Name, Ort und Telefon stimmen mit ${JSON.stringify(k.lead)} überein; ` +
      `keine erfundenen Zahlen, Preise, Bewertungen oder Teamnamen; keine Texte einer anderen Branche oder eines anderen Betriebs; ` +
      `Layout ohne Fehler. Melde jedes Problem konkret.`,
      { schema: KONTROLLE, phase: 'Kontrolle', label: `Kontrolle: ${k.lead.name}` },
    )
    let kontrolle = await pruefe()
    if (kontrolle && !kontrolle.freigabe && kontrolle.probleme.length) {
      await agent(
        `Behebe diese Probleme in ${demo.kundendatei} und baue neu mit node werkstatt/bauen.mjs ${demo.kundendatei}: ${kontrolle.probleme.join(' | ')}`,
        { agentType: 'demo-bauer', phase: 'Kontrolle', label: `Reparatur: ${k.lead.name}` },
      )
      kontrolle = await pruefe()
    }
    return { k, demo, kontrolle }
  },
  async (r) => {
    if (!r.kontrolle || !r.kontrolle.freigabe) return { ...r, texte: null }
    const texte = await agent(
      `Schreibe die Kontaktaufnahme für "${r.k.lead.name}" in den Ordner ${ordner}/${r.demo.slug}/.\n` +
      `Beobachtungen zur alten Website: ${r.k.pruefung.gruende.join('; ')}\n` +
      `Demo-Website: ${r.demo.ausgabe} (wird vor dem Versand online gestellt)\n` +
      `Angebot: ${a.angebot || '[ANGEBOT FESTLEGEN]'}\nAbsender: ${JSON.stringify(a.absender || { name: '[ABSENDER]' })}\n` +
      `Anschrift: ${r.k.lead.adresse || '[ANSCHRIFT]'}`,
      { agentType: 'anschreiben-texter', phase: 'Anschreiben', label: `Texte: ${r.k.lead.name}` },
    )
    return { ...r, texte }
  },
)

// 6. Übersicht
phase('Übersicht')
const zeilen = ergebnisse.filter(Boolean).map((r) => ({
  name: r.k.lead.name, kategorie: r.k.pruefung.kategorie, gruende: r.k.pruefung.gruende,
  demo: r.demo && r.demo.ausgabe, vorschau: r.demo && r.demo.vorschau,
  freigabe: !!(r.kontrolle && r.kontrolle.freigabe), probleme: r.kontrolle ? r.kontrolle.probleme : [],
  offene_punkte: r.demo ? r.demo.offene_punkte : [], texte: r.texte ? `${ordner}/${r.demo.slug}/` : null,
}))
await agent(
  `Schreibe ${ordner}/UEBERSICHT.md für den Inhaber: eine Tabelle mit allen Betrieben (Name, Kategorie, Gründe, Demo-Pfad, Status), ` +
  `danach pro freigegebenem Betrieb eine Checkliste: 1. Demo ansehen, 2. Demo online stellen und QR-Code in brief.md einsetzen, ` +
  `3. Brief senden oder anrufen, 4. E-Mail erst nach Einwilligung. Weise oben darauf hin, dass Werbe-E-Mails an Unternehmen ohne ` +
  `Einwilligung nach § 7 UWG unzulässig sind. Daten: ${JSON.stringify({ suche: a.suche, ort: a.ort, gefunden: gefunden.leads.length, geprueft: geprueft.length, ergebnisse: zeilen })}`,
  { label: 'Übersicht schreiben', effort: 'low' },
)

return { ordner, gefunden: gefunden.leads.length, kandidaten: kandidaten.length, demos: zeilen }
