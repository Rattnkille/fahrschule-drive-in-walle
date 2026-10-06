# MVP-Bauplan: FahrLotti

## Prinzip
- **Wizard of Oz:** Was teuer zu bauen ist, machen wir in den ersten Piloten manuell.
- **Bauen nur nach Bedarf:** Ein Feature wird gebaut, wenn ein Pilot-Partner es braucht.
- **Stack:** Klick-Demo mit Beispieldaten in Softr + Airtable (schnell, kostenlos). **Ab echten Schülerdaten (Pilot): Supabase in der EU-Region als Datenbank**, Softr als Oberfläche (Softr kann Supabase anbinden), Make.com (Sitz Prag) für Automatisierungen. Grund: Airtable speichert standardmäßig in den USA.

## Zuerst: Lotti Lückenfüller (Stufe 2 der Leiter)

**Ziel:** Absagen werden zu gefahrenen Stunden. Keine Umstellung für die Schule.

**Ablauf:**
1. Schüler melden sich bei der Schule auf die **Warteliste** (Formular-Link, den die Schule per WhatsApp verschickt): Name, Handy, Stadtteil, Ausbildungsstand, Zeiten, Einwilligung (bei unter 16 mit Eltern).
2. Absage passiert → Fahrlehrer füllt in 20 Sekunden das **„Freie Stunde“-Formular** aus (Datum, Uhrzeit, Abholort-Stadtteil, Klasse).
3. Lotti schickt die freie Stunde an die **3 bis 5 passendsten Schüler** (gleicher Stadtteil, passende Zeit) per SMS oder E-Mail mit Link „Ich nehme sie“.
4. **Wer zuerst klickt, bekommt die Stunde.** Die anderen sehen „schon vergeben“. Der Fahrlehrer bekommt sofort Name und Handynummer.
5. Wochenbericht an den Inhaber: Wie viele Lücken gemeldet, wie viele gefüllt, wie viel Umsatz gerettet.

**Technik (niedrigschwellig):** Tally oder Softr-Formulare → Supabase (EU) → Make.com → SMS über einen EU-Anbieter (z. B. seven.io oder Brevo) → einfache Bestätigungsseite.
**Wizard of Oz am Anfang:** In den ersten 2 Wochen darf der Gründer die Nachrichten auch von Hand verschicken, um den Ablauf zu testen.
**Aufwand:** ca. 3 bis 5 Arbeitstage. **Kosten:** ca. 20 bis 50 € pro Monat plus SMS-Gebühren.

## Ausbaustufen der vollen Plattform (Stufe 3, erst nach 3 zahlenden Lückenfüller-Kunden)

| Stufe | Inhalt | Wann | Kosten/Monat |
|---|---|---|---|
| **0: Klick-Demo** | Klickbarer Prototyp für Verkaufsgespräche (Softr mit Beispieldaten) | Woche 1 | 0 € (Free-Tarife) |
| **1: Pilot-Kern** | Fahrlehrer-Kalender, Schülerakte, Ausbildungskarte, Erinnerungen | Nach 1. Pilot-Zusage | ca. 50 bis 100 € |
| **2: Geld** | Vorkasse/Kaution über Stripe (Schule als Empfänger), Rechnungen über Lexoffice | Pilot Woche 2 bis 4 | + Transaktionsgebühren |
| **3: Schüler-Seite** | Warteliste live, Verfügbarkeits-Anzeige, Theorie-Deep-Link | ab 3 Piloten | ca. 50 € |
| **4: Prüfungsreife-Score** | Regelbasiert aus Ausbildungskarte und Theorie-Fortschritt | Pilot Monat 2 | 0 € |
| **5: Smarte Planung** | Slot-Vorschläge nach Stadtteil, Lückenfüller-Warteliste | Pilot Monat 2 bis 3 | 0 € |

## Datenmodell (Airtable-Tabellen, später Postgres)

| Tabelle | Wichtige Felder |
|---|---|
| `schulen` | id, name, adresse, stadtteil, stundenpreis, stornofrist_h, tarif, status |
| `fahrlehrer` | id, schule_id, name, klassen, arbeitszeiten, fahrzeug_id |
| `fahrzeuge` | id, schule_id, kennzeichen, getriebe, klasse |
| `schueler` | id, schule_id, name, geburtsdatum, minderjaehrig, erziehungsberechtigt_kontakt, klasse, abholort_stadtteil, status |
| `dokumente` | id, schueler_id, typ (sehtest, erste_hilfe, passbild, antrag), status, datei |
| `termine` | id, schule_id, fahrlehrer_id, schueler_id, fahrzeug_id, start, ende, typ (normal, autobahn, nacht, ueberland, pruefung), abholort, status (geplant, bestaetigt, gefahren, abgesagt, no_show) |
| `ausbildungskarte` | id, schueler_id, thema, stufe (1 bis 4), datum, fahrlehrer_id |
| `zahlungen` | id, schule_id, schueler_id, termin_id, betrag, art (vorkasse, kaution, rechnung), stripe_ref, status |
| `warteliste` | id, name, email, stadtteil, klasse, gewuenschter_start, einwilligung_zeitpunkt, quelle |
| `kennzahlen` | schule_id, woche, fahrstunden_gesamt, fahrlehrer_aktiv, no_shows, stunden_pro_fahrlehrer |

## Automatisierungen (Make.com)

1. **Erinnerung:** 24 h und 2 h vor Termin → Nachricht an Schüler (bei Minderjährigen optional auch an Eltern).
2. **Absage-Lückenfüller:** Termin abgesagt → die 3 passendsten Schüler (gleicher Stadtteil, Ausbildungsstand) bekommen Angebot, wer zuerst bestätigt, bekommt den Slot.
3. **No-Show:** Status `no_show` → Stornogebühr laut Schulregel über Stripe, Info an Schule.
4. **Rechnung:** Termin `gefahren` → Rechnungsposition in Lexoffice (im Namen der Schule).
5. **Wochenbericht:** Montags Kennzahlen je Schule (Nordstern) per E-Mail an den Inhaber.

## Geld-Fluss (ZAG-sicher)
- Schüler zahlen **direkt an die Fahrschule** (Stripe Connect: Schule ist eigenes Konto, FahrLotti ist Plattform).
- FahrLotti kassiert nur das eigene Abo von der Schule.
- Niemals Schülergeld auf eigenem Konto sammeln.

## Theorie (ab Reform)
- Stufe 3: Deep Link/Affiliate zu lizenzierter Lern-App.
- Danach: White Label mit Fortschritts-Export (Lizenzpartner von TÜV | DEKRA arge tp 21).
- Eigener Online-Theorieunterricht erst nach Prüfung des finalen Gesetzes und nur in Verantwortung der Fahrschule.
