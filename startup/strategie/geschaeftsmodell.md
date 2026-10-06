# Geschäftsmodell und Go-to-Market: FahrLotti

## Kurzfassung
- **Wer zahlt:** Fahrschulen (B2B). Schüler zahlen nichts.
- **Wofür:** Mehr abrechenbare Fahrstunden pro Fahrlehrer, weniger Büro.
- **Wie wir starten:** Angebot zuerst (Schulen), Nachfrage danach (Schüler).

---

## 1. Henne-Ei-Problem: Wer zuerst?

**Entscheidung: Schulen zuerst. Begründung:**
- Der Engpass in Bremen ist **Angebot** (Fahrlehrer), nicht Nachfrage (Schüler). Schüler zu sammeln, ohne freie Plätze zu haben, verbrennt Vertrauen.
- Das B2B-Tool hat **Einzelnutzer-Wert** (Single-Player-Mode): Eine Schule profitiert sofort, auch ohne Netzwerk. Das löst das Henne-Ei-Problem.
- Die Schüler-Seite startet als **Warteliste** und wird erst geöffnet, wenn mindestens 3 Schulen Kapazität einspeisen.

**Reihenfolge:**
| Phase | Seite | Taktik |
|---|---|---|
| 1 (Monat 1 bis 2) | Schulen | Persönlicher Brief, dann Besuch. Pilot kostenlos, wir richten alles ein (White Glove). Keine Kalt-E-Mails, keine Kaltanrufe (UWG § 7) |
| 2 (Monat 2 bis 3) | Schüler | Warteliste, Theorie-Lernplan, Kostenrechner, Social Media |
| 3 (ab 3 Piloten) | Beide | Live-Verfügbarkeit, Vermittlung freier Slots |
| 4 (ab 10 Schulen) | Netzwerk | Kapazitätsbörse zwischen Schulen |

---

## 2. Preismodelle im Vergleich

| Modell | Vorteile | Nachteile | Bewertung |
|---|---|---|---|
| **SaaS-Abo pro Schule + pro Fahrlehrer** | Planbarer MRR, einfach zu verkaufen, skaliert mit Schulgröße | Hürde für Kleinstschulen | **Kernmodell** |
| Vermittlungsgebühr pro Schüler | Zahlt nur bei Erfolg, leichter Einstieg | Schulen haben genug Schüler, Wert gering | Erst mit Kapazitätsbörse |
| Take-Rate pro bestandener Prüfung | Starkes Anreiz-Signal | Lange Zahlungsverzögerung (Monate), Streit über Zuordnung | Nein |
| Transaktionsgebühr auf Zahlungen (z. B. 1 %) | Wächst mit Umsatz der Schule | Wirkt wie Steuer, ZAG-Aufwand | Optional später via Stripe Connect |
| Freemium (Schule gratis, Schüler zahlen Theorie) | drivEddy-ähnlich, schneller Einstieg | Wettbewerb mit drivEddy, wenig Differenzierung | Nicht als Kern |

**Entscheidung:**
- Pilot 3 Monate kostenlos
- Danach **Gründerpreis 99 € pro Monat + 19 € je aktivem Fahrlehrer** (netto, monatlich kündbar)
- Preisanker für das Gespräch: *„Wenn ein Fahrlehrer nur **2 zusätzliche Fahrstunden pro Woche** fährt, sind das bei rund 60 € pro Stunde etwa 480 € Mehrumsatz im Monat.“* (Stundenpreis je Schule erfragen und einsetzen.)

---

## 3. Gesprächsleitfaden: Persönlicher Besuch (erste 10 Schulen)

**Wann:** Dienstag bis Donnerstag, 10 bis 12 Uhr (vor den Nachmittags-Fahrstunden, Büro ist besetzt). Vorher Öffnungszeiten prüfen.
**Mitbringen:** A6-Flyer, Tablet mit Demo (Klick-Prototyp), Visitenkarte, 1 Seite Pilot-Vereinbarung.

### Einstieg (30 Sekunden)
> „Moin, ich bin [NAME] aus Bremen. Ich baue eine Software, die Fahrschulen hier hilft, **mit denselben Fahrlehrern mehr Fahrstunden zu fahren**. Ich verkaufe heute nichts. Ich suche drei Bremer Fahrschulen, die das kostenlos mit mir testen. Haben Sie fünf Minuten, oder passt ein anderer Tag besser?“

### Diagnosefragen (zuhören, notieren)
1. „Wie viele Fahrlehrer haben Sie, und suchen Sie gerade jemanden?“
2. „Wie lange warten neue Schüler bis zur ersten Fahrstunde?“
3. „Wie viele Fahrstunden fallen pro Woche kurzfristig aus?“
4. „Wie viel Zeit geht pro Woche für Terminplanung, Rechnungen und Papierkram drauf, und wer macht das?“
5. „Wie planen Sie heute? (Papier, Excel, WhatsApp, Software?)“

### Wert spiegeln
> „Wenn ich Sie richtig verstehe, verlieren Sie pro Woche etwa [X] Stunden an [Ausfälle/Planung/Fahrten]. Genau da setzt FahrLotti an: Vorkasse gegen Ausfälle, Termine nach Stadtteil gebündelt, Rechnungen automatisch.“

### Einwände
| Einwand | Antwort |
|---|---|
| „Wir haben genug Schüler.“ | „Genau deshalb: Es geht nicht um mehr Schüler, sondern um **mehr Stunden mit Ihren vorhandenen Fahrlehrern**.“ |
| „Wir haben schon Software.“ | „Was nervt Sie daran am meisten? Wir ersetzen nichts sofort, der Pilot läuft parallel.“ |
| „Keine Zeit für Umstellung.“ | „**Ich richte alles selbst ein.** Sie geben mir eine Stunde, den Rest mache ich.“ |
| „Was kostet das?“ | „3 Monate nichts. Danach ab 99 € im Monat, monatlich kündbar. Wenn es sich nicht rechnet, hören Sie auf.“ |
| „Datenschutz?“ | „Auftragsverarbeitungsvertrag, Server in der EU, Sie bleiben Herr Ihrer Daten.“ |
| „Sind Sie drivEddy?“ | „Nein. drivEddy macht vor allem Theorie. Wir kümmern uns um Ihre Fahrlehrer-Zeit und Ihre Planung.“ |

### Abschluss (immer ein konkreter nächster Schritt)
> „Darf ich nächste Woche für 45 Minuten wiederkommen und Ihnen zeigen, wie Ihr Kalender darin aussieht? Dienstag oder Donnerstag?“

**Danach:** Gespräch im CRM (`startup/vertrieb/crm.md`) notieren. E-Mail mit Zusammenfassung **nur**, wenn der Inhaber zugestimmt hat.

---

## 4. Skalierungspfad
1. Bremen Stadt (Pilot, Referenzen)
2. Bremerhaven (gleiches Bundesland, gleiche Behörden-Logik)
3. Umland Niedersachsen: Delmenhorst, Oldenburg, Verden
4. Hamburg (Großstadt, gleicher Schmerz)
5. Bundesweit über Fahrlehrerverbände und Partnerprogramm (Schule wirbt Schule)
