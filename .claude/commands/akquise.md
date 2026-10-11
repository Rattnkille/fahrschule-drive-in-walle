---
description: Startet eine Akquise-Runde (Google Maps → Website-Check → Demo-Seiten → Anschreiben), z. B. /akquise Fahrschule Bremen
argument-hint: <Branche> <Ort> [max_demos]
---

Starte den gespeicherten Workflow `akquise` für: $ARGUMENTS

1. Lies `akquise/einstellungen.json`. Wenn dort noch `[…]`-Platzhalter beim Absender stehen, frag einmal kurz nach und trage die Antworten ein.
2. Rufe das Workflow-Tool mit `name: "akquise"` auf und übergib als `args` ein JSON-Objekt mit:
   - `suche`: erstes Wort aus den Argumenten (Branche)
   - `ort`: zweites Wort (Ort)
   - `datum`: heutiges Datum als JJJJ-MM-TT
   - `max_demos`: drittes Argument, sonst Wert aus den Einstellungen
   - `absender`, `angebot`, `scraper_pfad` aus den Einstellungen
3. Wenn der Workflow fertig ist: Öffne die erzeugte `UEBERSICHT.md` und fasse kurz zusammen, welche Betriebe eine Demo bekommen haben und was ich jetzt freigeben muss.

Nichts versenden. Der Versand bleibt bei mir.
