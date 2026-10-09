---
name: nano-banana
description: Erzeugt und bearbeitet Bilder mit Nano Banana Pro (Google Gemini 3 Pro Image) über Vertex AI. Verwenden, wenn der Nutzer ein Bild, Foto, eine Grafik, Illustration, ein Social-Media-Bild (Instagram, Story, Post, Thumbnail), Flyer- oder Plakat-Motiv, Banner, Hero-Bild oder Produktfoto erstellen möchte, oder ein bestehendes Foto verbessern, bearbeiten, retuschieren, umfärben, freistellen, den Hintergrund ändern oder Varianten davon erzeugen will.
---

# Nano Banana Pro (Bilder erzeugen und bearbeiten)

Bilder werden über das Google-Cloud-Projekt aus `config.json` (Standard `jonis-bilder`) per Vertex AI erzeugt und mit den Google-Cloud-Credits abgerechnet.

## Aufruf

```bash
~/.claude/skills/nano-banana/nano-banana "PROMPT" [Optionen]
```

Der Wrapper nutzt die eigene Python-Umgebung des Skills (`.venv`), ruf also nicht `python3 nano_banana.py` direkt auf.

| Option | Bedeutung | Standard |
|---|---|---|
| `PROMPT` | Bildbeschreibung oder gewünschte Änderung (Pflicht) | |
| `-o DATEI` | Ausgabedatei | `./bilder/JJJJ-MM-TT_HHMMSS.png` |
| `-i BILD [BILD ...]` | Eingabebild(er) zum Bearbeiten oder als Stil-/Motiv-Referenz | keins |
| `-a VERHÄLTNIS` | `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9` | `4:5` |
| `-s AUFLÖSUNG` | `1K`, `2K`, `4K` | `2K` |

Liefert das Modell mehrere Bilder, werden sie als `name_1.png`, `name_2.png` usw. gespeichert. Das Skript gibt die Pfade und eventuellen Text des Modells aus.

## Beispiele

```bash
# Neues Bild
~/.claude/skills/nano-banana/nano-banana "Neapolitanische Pizza Margherita frisch aus dem Holzofen, Abendlicht, Food-Fotografie"

# Instagram-Story
~/.claude/skills/nano-banana/nano-banana "Sommer-Aktion Flyer-Motiv, Pizza am Strand, viel Freiraum oben für Text" -a 9:16

# Foto bearbeiten
~/.claude/skills/nano-banana/nano-banana "mach den Hintergrund dunkler, Pizza unverändert lassen" -i bilder/pizza.png -o bilder/pizza_dunkel.png
```

## Gute Prompts

- Motiv, Umgebung, Licht, Kamerawinkel und Stil konkret benennen (z. B. "Food-Fotografie, 45 Grad, warmes Abendlicht, geringe Schärfentiefe").
- Beim Bearbeiten klar sagen, was sich ändern soll und was gleich bleiben muss.
- Text im Bild in Anführungszeichen angeben und die Sprache nennen.
- Seitenverhältnis passend zum Zweck: Feed `4:5`, Story/Reel `9:16`, Website-Banner `16:9`, Profil `1:1`.

## Kosten (wichtig)

- Jedes Bild kostet ca. **0,13 $ (1K/2K) bis 0,25 $ (4K)**, abgerechnet über das 10-$-Monatsguthaben.
- Standardmäßig **ein Bild pro Anfrage**. Keine Massen-Generierungen ohne Rückfrage.
- **Mehr als 4 Bilder in einem Auftrag nur nach ausdrücklicher Bestätigung** durch den Nutzer (vorher Anzahl und geschätzte Kosten nennen).
- `4K` nur nutzen, wenn der Nutzer es braucht (Druck, Großformat).

## Nach dem Erzeugen

- Erzeugtes Bild ansehen (Read-Tool auf den Pfad) und kurz prüfen, ob es zum Wunsch passt.
- Auf dem Mac mit `open PFAD` öffnen, wenn der Nutzer es sehen möchte.

## Fehlerbehebung

| Meldung | Lösung |
|---|---|
| Keine Google-Anmeldung / Anmeldung abgelaufen | `gcloud auth application-default login` |
| Billing nicht aktiv | Billing-Konto in der Cloud Console mit dem Projekt verknüpfen |
| API nicht aktiviert | `gcloud services enable aiplatform.googleapis.com --project=PROJEKT` |
| Modell nicht gefunden | Skript probiert automatisch `gemini-3-pro-image-preview`; sonst Modellverfügbarkeit im Vertex AI Model Garden prüfen |
| Sicherheitsfilter (Exit-Code 2) | Prompt umformulieren, keine echten Personen/Marken nachbilden |

Restguthaben: https://console.cloud.google.com/billing (Abschnitt "Gutschriften").
