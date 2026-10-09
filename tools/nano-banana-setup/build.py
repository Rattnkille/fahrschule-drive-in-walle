#!/usr/bin/env python3
"""Erzeugt install-nano-banana.sh: setup.sh mit eingebettetem nano_banana.py und SKILL.md."""

from pathlib import Path

HERE = Path(__file__).resolve().parent
setup = (HERE / "setup.sh").read_text()
script = (HERE / "nano_banana.py").read_text()
skill = (HERE / "SKILL.md").read_text()

for name, text in (("nano_banana.py", script), ("SKILL.md", skill)):
    if "__NANO_BANANA_EOF__" in text:
        raise SystemExit(f"{name} enthält das Heredoc-Endzeichen")

embedded = (
    "write_skill_files() {\n"
    "  cat > \"$SKILL_DIR/nano_banana.py\" <<'__NANO_BANANA_EOF__'\n"
    f"{script.rstrip()}\n__NANO_BANANA_EOF__\n"
    "  cat > \"$SKILL_DIR/SKILL.md\" <<'__NANO_BANANA_EOF__'\n"
    f"{skill.rstrip()}\n__NANO_BANANA_EOF__\n"
    "}\n"
)

start = setup.index("write_skill_files() {")
end = setup.index("\n}\n", start) + 3
bundle = setup[:start] + embedded + setup[end:]
bundle = bundle.replace(
    "# Quelle: tools/nano-banana-setup/setup.sh. Die fertige Ein-Datei-Version\n"
    "# install-nano-banana.sh wird mit build.py erzeugt (bettet nano_banana.py und SKILL.md ein).",
    "# Automatisch erzeugt aus tools/nano-banana-setup (build.py). Nicht direkt bearbeiten.",
)

out = HERE / "install-nano-banana.sh"
out.write_text(bundle)
out.chmod(0o755)
print(f"geschrieben: {out}")
