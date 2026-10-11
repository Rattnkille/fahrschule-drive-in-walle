# Akquise-Plan: Websites für lokale Betriebe

> **Status:** Prototyp Drive In Walle ist fertig. Die Werkstatt (`werkstatt/`, Skill `website-bauen`) erzeugt Demo-Seiten aus einer Kundendatei. Nächster Schritt: Pilot mit 10 Betrieben, dafür fehlt noch der Places-API-Key.

## Idee
Lokale Betriebe (Fahrschulen, Flugschulen, Paragliding, …) finden, eine Demo-Website vorab bauen und sie für einen fairen Preis oder im Tausch (z. B. Motorradführerschein) verkaufen.

## Ablauf
| Schritt | Was | Wer |
|---|---|---|
| 1. Suchen | Google Places API, z. B. „Fahrschule Bremen“ | automatisch |
| 2. Bewerten | Website fehlt, ist alt, langsam oder nicht mobil? Punkte vergeben | automatisch (später günstiges Modell) |
| 3. Auswählen | Top 10 mit Begründung | **Freigabe** |
| 4. Bauen | Demo-Seite aus echten Profildaten, Ablauf wie im 7-Phasen-Prompt | automatisch |
| 5. Online | Vercel-Vorschau-Link | automatisch |
| 6. Erstkontakt | Brief mit QR-Code zur Demo (Druckdienst mit API), Telefon-Leitfaden | **Freigabe** |
| 7. Nachfassen | Mail/WhatsApp erst nach Antwort, Angebot | **Freigabe** |

## Rechtliche Leitplanken
- Werbe-E-Mails und Messenger-Nachrichten brauchen auch B2B eine vorherige ausdrückliche Einwilligung (§ 7 UWG). Kein Kaltversand per Mail oder WhatsApp.
- Erlaubt: Brief, persönlicher Besuch, Telefon B2B nur bei mutmaßlicher Einwilligung (Grauzone).
- Vor Start: kurzer Check durch Anwalt für Wettbewerbsrecht.
- Tauschgeschäfte sind Umsatz: beide Seiten stellen Rechnung über den Wert.
- Vercel Hobby ist nur für private Projekte. Für Kundenseiten Pro-Tarif oder anderes Hosting.

## Wirtschaftlichkeit (Schätzung, vor Pilot)
- Preis: Onepager 800–1.200 €, kleine Website 1.200–2.000 €, Wartung 30–60 €/Monat
- 100 Briefe/Monat (ca. 100–150 €) → 2–5 Antworten → 1–2 Kunden
- Hebel ist die laufende Wartung, die mit jedem Kunden wächst

## Modelle und Werkzeuge
- Claude: Planung, Design, Kontrolle
- Massenbewertung: Haiku-Subagents, später ggf. DeepSeek/Gemini über OpenRouter
- OpenClaw (Mira) lokal: lohnt erst ab etwa 500 Betrieben pro Monat. Skill `openclaw-claude-delegate` nutzt `bypassPermissions`, nur in eigenem Arbeitsordner und mit Budget einsetzen.

## Benötigt für den Pilot
- `GOOGLE_PLACES_API_KEY` aus einem funktionierenden Google-Konto
- optional `OPENROUTER_API_KEY`
- Erkenntnisse aus dem Drive-In-Walle-Projekt (Zeitaufwand, Qualität, was der Kunde wirklich braucht)

## So startest du eine Runde (automatisiert)

**Voraussetzungen auf dem Mac (einmalig)**
- Repo lokal klonen und darin Claude Code öffnen
- Node.js, Docker (für den Google Maps Scraper) und `npx playwright install chromium`
- `akquise/einstellungen.json` ausfüllen (Absender, Angebot, ggf. Pfad zum Scraper)

**Start in einem neuen Tab**
```
/akquise Fahrschule Bremen 5
```

**Was automatisch passiert**
| Phase | Subagent | Modell |
|---|---|---|
| Suchen | `lead-scout` (Scraper oder CSV) | Standard |
| Prüfen | `website-pruefer` pro Betrieb, parallel | Haiku (günstig) |
| Bauen | `demo-bauer` (Kundendatei + Werkstatt) | Standard |
| Kontrolle | unabhängiger Prüfer, eine Reparaturrunde | Standard |
| Anschreiben | `anschreiben-texter` (Brief, Telefon, E-Mail-Entwurf) | Standard |
| Übersicht | `UEBERSICHT.md` mit Freigabe-Checkliste | Standard |

**Was bei dir bleibt:** Demos ansehen, online stellen, Brief abschicken oder anrufen. E-Mails erst nach Einwilligung.

Dateien: `.claude/workflows/akquise.js`, `.claude/agents/*.md`, `.claude/commands/akquise.md`, Ergebnisse in `akquise/<datum>-<branche>-<ort>/` (nicht im Git).
