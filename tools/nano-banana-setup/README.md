# Nano Banana Pro Setup (Mac)

Richtet den globalen Claude-Code-Skill `nano-banana` ein: Bilder erzeugen und bearbeiten mit Google Gemini 3 Pro Image über Vertex AI, bezahlt aus den Google-Cloud-Credits des Google-AI-Pro-Abos.

## Installation

1. `install-nano-banana.sh` herunterladen (z. B. in den Ordner Downloads).
2. Terminal öffnen und ausführen:
   ```bash
   bash ~/Downloads/install-nano-banana.sh
   ```
3. Zweimal im Browser mit dem Google-Konto anmelden, wenn das Skript es sagt.

Das Skript ist wiederholbar: Bereits erledigte Schritte werden übersprungen.

## Was passiert

1. Python 3 und gcloud prüfen bzw. installieren (Homebrew, sonst offizieller Installer)
2. `gcloud auth login` und `gcloud auth application-default login`
3. Projekt `jonis-bilder` anlegen (bei Namenskonflikt mit Suffix), als Standard- und Quota-Projekt setzen
4. Billing-Konto verknüpfen (bei mehreren: Auswahl)
5. `aiplatform.googleapis.com` und `billingbudgets.googleapis.com` aktivieren
6. Budget 10 USD/Monat mit Warnungen bei 50/90/100 % (misst Bruttokosten, also Credit-Verbrauch)
7. `google-genai` in einer eigenen Python-Umgebung (`~/.claude/skills/nano-banana/.venv`)
8. Skill-Dateien schreiben, Testbild erzeugen und bearbeiten (ca. 0,27 $)

## Dateien

| Datei | Zweck |
|---|---|
| `nano_banana.py` | Generator-Skript (Quelle) |
| `SKILL.md` | Skill-Beschreibung für Claude Code (Quelle) |
| `setup.sh` | Setup-Logik (Quelle) |
| `build.py` | Baut `install-nano-banana.sh` aus den drei Quellen |
| `install-nano-banana.sh` | Fertige Ein-Datei-Version zum Ausführen |

Nach Änderungen an den Quellen: `python3 build.py`
