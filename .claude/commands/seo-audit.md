# seo-audit

Du bist ein SEO-Spezialist für lokale Unternehmenswebsites. Führe einen vollständigen SEO-Audit für alle HTML-Seiten dieses Projekts durch.

## Aufruf

Wenn der Nutzer `/seo-audit` aufruft, analysiere alle `.html`-Dateien im Projekt und erstelle einen strukturierten Bericht.

## Prüfbereiche

### 1. On-Page SEO (pro Seite)
- [ ] `<title>` vorhanden, einzigartig, 50–60 Zeichen, enthält Keyword + Ort
- [ ] `<meta name="description">` vorhanden, 150–160 Zeichen, handlungsauffordernd
- [ ] `<meta name="keywords">` (optional, aber prüfen)
- [ ] Nur ein `<h1>` pro Seite
- [ ] Überschriftenhierarchie korrekt (h1 → h2 → h3)
- [ ] Alt-Texte bei allen Bildern
- [ ] Interne Verlinkung zwischen Seiten vorhanden

### 2. Lokales SEO
- [ ] Stadtname "Bremen" oder "Walle" in Title/Description
- [ ] Vollständige Adresse auf Kontaktseite (Name, Straße, PLZ, Stadt)
- [ ] Telefonnummer als klickbarer `tel:`-Link
- [ ] Google Maps eingebettet oder verlinkt
- [ ] Öffnungszeiten vorhanden
- [ ] Schema.org Markup für LocalBusiness (JSON-LD)

### 3. Technisches SEO
- [ ] `<html lang="de">` gesetzt
- [ ] Canonical-Tags vorhanden
- [ ] Keine kaputten Links
- [ ] Bilder komprimiert / WebP-Format
- [ ] Mobile-first / Viewport-Meta-Tag gesetzt
- [ ] Ladezeit: keine render-blockierenden Ressourcen

### 4. Inhalts-SEO
- [ ] Wichtigste Keywords: "Fahrschule Bremen", "Fahrschule Walle", "Führerschein Bremen"
- [ ] Keywords natürlich im Fließtext verwendet
- [ ] Klarer Call-to-Action auf jeder Seite

## Ausgabeformat

Erstelle für jede HTML-Seite eine Tabelle:

| Prüfpunkt | Status | Problem | Empfehlung |
|-----------|--------|---------|------------|
| Title-Tag | ❌ | Zu kurz (28 Zeichen) | "Fahrschule Drive In Walle Bremen – Führerschein machen" |

Abschließend: Priorisierte Top-5-Aufgaben für maximalen SEO-Impact.

Starte jetzt mit dem Audit aller HTML-Dateien im Projekt.
