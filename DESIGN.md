# DESIGN – Fahrschule Drive In Walle

> **Status: Phase 2, Entwurf.** Grundlage: das echte Logo im Schaufenster (oranger Reifen, blaues „IN“, schwarzes „Walle“ mit Pfeil) statt der generischen Farben aus `brand-guide.md`. Eine godly.design-Referenz kann die Werte später noch schärfen.

## Leitidee
**Ruhig wie eine gute Fahrstunde.** Viel Luft, klare Hierarchie, eine einzige Akzentfarbe für Handlungen. Die Seite soll Nervösen die Angst nehmen und trotzdem nach Marke aussehen, nicht nach Baukasten.

**Was die Seite teuer wirken lässt**
- Große, selbstbewusste Headlines mit engem Zeilenabstand
- Großzügige Abstände, wenige Elemente pro Sektion
- Ein wiederkehrendes Motiv: die **Fahrbahnmarkierung** (gestrichelte Linie) aus dem Schaufenster
- Echte Fotos statt Stockbilder

## Farben
| Rolle | Hex | Einsatz |
|---|---|---|
| Ink | `#14171C` | Text, dunkle Flächen |
| Ink weich | `#4A5260` | Fließtext sekundär (Kontrast 7,6:1 auf Papier) |
| Papier | `#F7F5F0` | Seitenhintergrund (warmes Off-White) |
| Weiß | `#FFFFFF` | Karten |
| Linie | `#E3DFD6` | Rahmen, Trenner |
| Blau (Marke) | `#1E7FD0` | Flächen, Grafiken, große Schrift |
| Blau tief | `#145FA0` | Links und Text in Blau (Kontrast ≥ 5,9:1 auf Weiß) |
| Orange (Akzent) | `#EE7A2C` | **Nur** Haupt-Button und Highlights, Text darauf in Ink |
| Orange hell | `#FDE9DA` | Hinweisflächen (z. B. Rabatt) |

Regel: Orange erscheint pro Bildschirm höchstens zweimal.

## Typografie
- **Schrift:** Plus Jakarta Sans (Google Fonts), eine Familie für alles
- **Skala (Desktop / Mobil):**
  - Display: 72 / 44 px, Gewicht 800, Zeilenhöhe 1.02, Laufweite −0,03em
  - H2: 44 / 32 px, 750, 1.1
  - H3: 22 / 20 px, 700, 1.3
  - Body groß: 20 / 18 px, 450, 1.55
  - Body: 17 / 16 px, 450, 1.6
  - Label: 13 px, 700, Versalien, Laufweite +0,08em

## Abstände
- 8-px-Raster: 8, 16, 24, 32, 48, 64, 96, 128
- Sektionen: 128 px oben/unten (mobil 72 px)
- Inhaltsbreite max. 1200 px, Text max. 62 Zeichen

## Formen
- Radius: 14 px Karten, 999 px Buttons
- Keine Schlagschatten; Tiefe nur über Fläche und Linie

## Bewegung
- Zurückhaltend: Einblenden beim Scrollen, 350 ms, 12 px Versatz
- Hover: Farbe oder Opazität, 180 ms
- `prefers-reduced-motion` wird respektiert

## Layout-Rhythmus
Hell (Hero) → Weiß (Leistungen) → Ink (Beweise/Zahlen) → Papier (Ablauf/Preise) → Blau (Abschluss-CTA)

## Verboten
- Zentrierter Standard-Hero mit drei gleichen Karten darunter
- Emojis als Icons (stattdessen SVG)
- Stockfotos mit gestellten Handshakes, Text im Bild
- Erfundene Zahlen und Bewertungen
