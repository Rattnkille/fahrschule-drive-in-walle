---
name: website-bauen
description: Baut eine fertige, abgabebereite Onepager-Website für einen lokalen Betrieb (Fahrschule, Flugschule, Paragliding, Handwerk …) aus einer Kundendatei und packt sie als ZIP für Hostinger. Verwenden, wenn eine neue Kunden-Website erstellt, eine bestehende Kundendatei geändert oder eine Demo-Seite für die Akquise gebaut werden soll.
---

# Website bauen (Werkstatt)

Prototyp und Referenz ist die Website von Fahrschule Drive In Walle (Repo-Wurzel). Die Werkstatt erzeugt daraus beliebig viele Kunden-Websites.

## Aufbau
- `werkstatt/vorlage/` HTML-Vorlagen mit Platzhaltern, Styles, Schrift (lokal), `.htaccess`
- `werkstatt/kunden/<slug>.json` alle Inhalte eines Kunden
- `werkstatt/kunden/<slug>/hero.jpg`, `standort.jpg` optionale Fotos
- `werkstatt/bauen.mjs` Generator: `node werkstatt/bauen.mjs werkstatt/kunden/<slug>.json`
- Ausgabe: `werkstatt/ausgabe/<slug>/` und `<slug>.zip` (nicht im Git)

## Ablauf (7 Phasen, angelehnt an den 10.000-€-Prompt)

1. **Inhalt sammeln.** Eine Kundendatei aus `beispiel-flugschule.json` kopieren. Echte Daten eintragen: Name, Ort, Telefon, Angebot, Zielgruppen, FAQ, Rechtsangaben. Quellen: Google-Profil, alte Website, Schaufenster, Gespräch mit dem Inhaber. Fehlendes als `[GROSSBUCHSTABEN IN KLAMMERN]` markieren.
2. **Design.** Farben aus dem echten Logo ableiten (`farben.primaer`, `primaer_tief` mit Kontrast ≥ 4,5:1 auf Weiß, `akzent` für Buttons). Regeln in `DESIGN.md` gelten für alle Kunden.
3. **Hero.** Headline spricht die größte Sorge der Zielgruppe an (Fahrschule: Nervosität, Paragliding: Sicherheit). Bei Bedarf 2 bis 3 Varianten zur Auswahl.
4. **Bilder.** Echte Fotos bevorzugen. Sonst ein KI-Leitbild (Higgsfield, Modell `nano_banana_2_1`, 16:9, 2k, ca. 2 Credits) mit Negativ-Prompt: kein Text, keine Logos, kein Stockfoto-Look. KI-Bilder im Bildnachweis kennzeichnen. Ohne Fotos zeigt die Seite automatisch Grafiken.
5. **Bauen.** Generator ausführen. Er meldet alle offenen `[…]`-Platzhalter. Mit Playwright bei 1440 px und 390 px prüfen: keine JS-Fehler, kein horizontales Scrollen, keine externen Requests.
6. **Polieren und Vorschau.** Feedback einarbeiten. Vorschau als privates Artifact veröffentlichen (`index.html` plus `styles.css`, `script.js`, Schriften als `files`).
7. **Abgabe.** ZIP plus `abgabe/ANLEITUNG-HOSTINGER.md` an den Kunden. Live erst, wenn Impressum und Datenschutz vollständig sind.

## Harte Regeln
- **Nichts erfinden:** keine Zahlen, Preise, Bewertungen, Teamnamen oder Adressen ohne Quelle. Lieber weglassen (Abschnitte `kosten`, `angebot`, Links in `kontakt` sind optional).
- **Keine externen Dienste** auf der Seite (keine Google Fonts, kein Tracking, keine eingebetteten Karten). Dann ist kein Cookie-Banner nötig.
- **Impressum (§ 5 DDG) und Datenschutz** müssen vor dem Livegang echte Angaben enthalten. Branchenspezifische Pflichtangaben (z. B. Erlaubnisbehörde bei Fahrschulen) in `recht.berufsangaben`.
- **Keine Kalt-Mails oder WhatsApp** an Betriebe für die Akquise (§ 7 UWG). Siehe `docs/AKQUISE-PLAN.md`.

## Kundendatei: wichtigste Felder
| Feld | Hinweis |
|---|---|
| `logo` | Liste aus Wortteilen, `farbe`: `primaer`, `akzent` oder leer |
| `zielgruppen.liste[].icon` | `schule`, `job`, `herz`, `schild`, `stern`, `berg`, `wind`, `menschen` |
| `kosten`, `angebot` | weglassen, wenn es keine echten Angaben gibt |
| `kontakt.*_link` | leerer String blendet den Eintrag aus |
| `schema_typ` | schema.org-Typ, z. B. `DrivingSchool`, `SportsActivityLocation`, `LocalBusiness` |

## Bekannte Grenzen
- Die Hero-Grafik (Straße mit Reifen) passt am besten zu Fahrschulen. Für andere Branchen ein Foto verwenden oder die Grafik in der Vorlage austauschen.
