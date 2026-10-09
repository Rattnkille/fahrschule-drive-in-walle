#!/usr/bin/env python3
"""Nano Banana Pro (Gemini 3 Pro Image) über Vertex AI.

Bilder erzeugen oder vorhandene Bilder bearbeiten.

Beispiele:
  nano_banana.py "Pizza Margherita aus dem Holzofen, Food-Fotografie"
  nano_banana.py "mach den Hintergrund dunkler" -i foto.jpg -o foto_dunkel.png
  nano_banana.py "Flyer-Motiv im Stil des Referenzbildes" -i ref1.png ref2.png -a 9:16 -s 4K
"""

import argparse
import json
import mimetypes
import os
import sys
from datetime import datetime
from pathlib import Path

DEFAULT_PROJECT = "jonis-bilder"
LOCATION = "global"
MODELS = ["gemini-3-pro-image", "gemini-3-pro-image-preview"]
ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"]
SIZES = ["1K", "2K", "4K"]
CONFIG_FILE = Path(__file__).resolve().parent / "config.json"

SAFETY_REASONS = {
    "SAFETY", "IMAGE_SAFETY", "PROHIBITED_CONTENT", "IMAGE_PROHIBITED_CONTENT",
    "BLOCKLIST", "SPII", "RECITATION", "IMAGE_RECITATION",
}


def fail(msg, code=1):
    print(f"FEHLER: {msg}", file=sys.stderr)
    sys.exit(code)


def resolve_project():
    if os.environ.get("NANO_BANANA_PROJECT"):
        return os.environ["NANO_BANANA_PROJECT"]
    if CONFIG_FILE.exists():
        try:
            return json.loads(CONFIG_FILE.read_text()).get("project") or DEFAULT_PROJECT
        except (OSError, ValueError):
            pass
    return DEFAULT_PROJECT


def parse_args():
    p = argparse.ArgumentParser(
        description="Bilder mit Nano Banana Pro (Gemini 3 Pro Image) erzeugen oder bearbeiten.")
    p.add_argument("prompt", help="Beschreibung des Bildes bzw. der gewünschten Änderung")
    p.add_argument("-o", "--output",
                   help="Ausgabedatei (Standard: ./bilder/JJJJ-MM-TT_HHMMSS.png)")
    p.add_argument("-i", "--input", nargs="+", default=[], metavar="BILD",
                   help="Ein oder mehrere Eingabebilder (zum Bearbeiten oder als Referenz)")
    p.add_argument("-a", "--aspect", default="4:5", choices=ASPECT_RATIOS,
                   help="Seitenverhältnis (Standard: 4:5)")
    p.add_argument("-s", "--size", default="2K", type=str.upper, choices=SIZES,
                   help="Auflösung (Standard: 2K)")
    return p.parse_args()


def output_paths(base, count):
    if base:
        base = Path(base).expanduser()
        if base.suffix == "":
            base = base.with_suffix(".png")
    else:
        base = Path("bilder") / (datetime.now().strftime("%Y-%m-%d_%H%M%S") + ".png")
    base.parent.mkdir(parents=True, exist_ok=True)
    if count == 1:
        return [base]
    return [base.with_name(f"{base.stem}_{n}{base.suffix}") for n in range(1, count + 1)]


def load_inputs(paths, types):
    parts = []
    for raw in paths:
        path = Path(raw).expanduser()
        if not path.is_file():
            fail(f"Eingabebild nicht gefunden: {path}")
        mime = mimetypes.guess_type(path.name)[0]
        if path.suffix.lower() in (".heic", ".heif"):
            mime = "image/heic"
        if not mime or not mime.startswith("image/"):
            fail(f"Kein unterstütztes Bildformat: {path} (erlaubt: PNG, JPEG, WEBP, HEIC)")
        parts.append(types.Part.from_bytes(data=path.read_bytes(), mime_type=mime))
    return parts


def explain_api_error(err, project):
    code = getattr(err, "code", None)
    text = str(err)
    low = text.lower()
    if "billing" in low:
        return (f"Billing ist für Projekt '{project}' nicht aktiv. Prüfe in der Konsole: "
                f"https://console.cloud.google.com/billing/linkedaccount?project={project}")
    if "has not been used" in low or "is disabled" in low or "service_disabled" in low:
        return (f"Die Vertex AI API ist nicht aktiviert. Ausführen: "
                f"gcloud services enable aiplatform.googleapis.com --project={project}")
    if code in (401,) or "unauthenticated" in low or "reauth" in low:
        return "Anmeldung abgelaufen. Ausführen: gcloud auth application-default login"
    if code == 403:
        return (f"Keine Berechtigung für Projekt '{project}'. Bist du mit dem richtigen "
                f"Google-Konto angemeldet? (gcloud auth application-default login)\n{text}")
    if code == 429:
        return "Kontingent erreicht (zu viele Anfragen). Kurz warten und erneut versuchen."
    if code == 400 and "safety" in low:
        return "Die Anfrage wurde vom Sicherheitsfilter blockiert. Formuliere den Prompt anders."
    return text


def main():
    args = parse_args()

    try:
        from google import genai
        from google.genai import errors, types
    except ImportError:
        fail("Paket 'google-genai' fehlt. Installieren mit: pip install google-genai")

    try:
        import google.auth
        from google.auth.exceptions import DefaultCredentialsError
    except ImportError:
        fail("Paket 'google-auth' fehlt. Installieren mit: pip install google-genai")

    project = resolve_project()

    try:
        google.auth.default()
    except DefaultCredentialsError:
        fail("Keine Google-Anmeldung gefunden. Ausführen: gcloud auth application-default login")

    client = genai.Client(vertexai=True, project=project, location=LOCATION)
    contents = load_inputs(args.input, types) + [args.prompt]
    config = types.GenerateContentConfig(
        response_modalities=["IMAGE", "TEXT"],
        image_config=types.ImageConfig(aspect_ratio=args.aspect, image_size=args.size),
    )

    response = None
    used_model = None
    for model in MODELS:
        try:
            response = client.models.generate_content(model=model, contents=contents, config=config)
            used_model = model
            break
        except errors.ClientError as err:
            if err.code == 404 and model != MODELS[-1]:
                continue
            if err.code == 404:
                fail(f"Modell nicht gefunden ({', '.join(MODELS)}). Ist Gemini 3 Pro Image in "
                     f"Projekt '{project}' verfügbar? Region: {LOCATION}")
            fail(explain_api_error(err, project))
        except errors.ServerError as err:
            fail(f"Serverfehler bei Google ({err.code}). Bitte später erneut versuchen.\n{err}")
        except DefaultCredentialsError:
            fail("Keine Google-Anmeldung gefunden. Ausführen: gcloud auth application-default login")
        except Exception as err:  # z. B. RefreshError bei abgelaufenem Login
            if "refresh" in type(err).__name__.lower() or "reauth" in str(err).lower():
                fail("Anmeldung abgelaufen. Ausführen: gcloud auth application-default login")
            raise

    feedback = getattr(response, "prompt_feedback", None)
    if feedback and getattr(feedback, "block_reason", None):
        fail(f"Prompt vom Sicherheitsfilter blockiert ({feedback.block_reason}). "
             f"Formuliere ihn anders.", code=2)

    images, texts, reasons = [], [], []
    for cand in response.candidates or []:
        if cand.finish_reason:
            reasons.append(getattr(cand.finish_reason, "name", str(cand.finish_reason)))
        for part in (cand.content.parts if cand.content and cand.content.parts else []):
            if part.inline_data and part.inline_data.data:
                images.append(part.inline_data.data)
            elif part.text and not getattr(part, "thought", False):
                texts.append(part.text.strip())

    if not images:
        blocked = [r for r in reasons if r in SAFETY_REASONS]
        if blocked:
            fail(f"Bild vom Sicherheitsfilter blockiert ({', '.join(blocked)}). "
                 f"Formuliere den Prompt anders.", code=2)
        extra = f"\nAntwort des Modells: {' '.join(texts)}" if texts else ""
        fail(f"Kein Bild zurückgegeben (Grund: {', '.join(reasons) or 'unbekannt'}).{extra}")

    print(f"Modell: {used_model} | Projekt: {project} | {args.aspect} | {args.size}")
    for path, data in zip(output_paths(args.output, len(images)), images):
        path.write_bytes(data)
        print(f"Gespeichert: {path.resolve()}")
    if texts:
        print("Text vom Modell:", " ".join(t for t in texts if t))


if __name__ == "__main__":
    main()
