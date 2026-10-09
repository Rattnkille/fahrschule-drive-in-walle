#!/usr/bin/env bash
# Nano Banana Pro (Gemini 3 Pro Image) über Vertex AI einrichten.
# Legt den globalen Claude-Code-Skill ~/.claude/skills/nano-banana an.
#
# Quelle: tools/nano-banana-setup/setup.sh. Die fertige Ein-Datei-Version
# install-nano-banana.sh wird mit build.py erzeugt (bettet nano_banana.py und SKILL.md ein).

set -uo pipefail

PROJECT_BASE="jonis-bilder"
PROJECT_LABEL="created-by=nano-banana-setup"
BUDGET_NAME="Nano Banana 10 USD"
SKILL_DIR="$HOME/.claude/skills/nano-banana"
TEST_DIR="$HOME/bilder"

bold() { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[32m✔\033[0m %s\n' "$*"; }
info() { printf '  \033[34m›\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
die()  { printf '\n  \033[31m✘ %s\033[0m\n' "$*"; exit 1; }

# Liest Eingaben auch dann vom Terminal, wenn das Skript per "curl | bash" läuft
ask() { local REPLY; read -r -p "  $1 " REPLY </dev/tty; printf '%s' "$REPLY"; }

# ---------------------------------------------------------------------------
bold "1/11  System prüfen"
OS="$(uname -s)"
info "Betriebssystem: $OS $(uname -m)"
[ "$OS" = "Darwin" ] || warn "Dieses Skript ist für macOS gedacht, ich versuche es trotzdem."

if [ "$OS" = "Darwin" ] && ! command -v brew >/dev/null 2>&1; then
  for p in /opt/homebrew/bin/brew /usr/local/bin/brew; do
    [ -x "$p" ] && eval "$("$p" shellenv)" && break
  done
fi
HAVE_BREW=0; command -v brew >/dev/null 2>&1 && HAVE_BREW=1

if ! python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)' >/dev/null 2>&1; then
  if [ $HAVE_BREW = 1 ]; then
    info "Python 3 fehlt oder ist zu alt, installiere über Homebrew …"
    brew install python || die "Python-Installation fehlgeschlagen."
  else
    die "Python 3.9+ fehlt. Installiere es mit 'xcode-select --install' oder von https://www.python.org/downloads/ und starte das Skript neu."
  fi
fi
ok "$(python3 --version)"
python3 -m venv --help >/dev/null 2>&1 || die "python3 -m venv nicht verfügbar."
ok "pip/venv verfügbar"

# ---------------------------------------------------------------------------
bold "2/11  Google Cloud CLI (gcloud)"
load_gcloud_path() {
  for inc in "$(brew --prefix 2>/dev/null)/share/google-cloud-sdk/path.bash.inc" \
             "$(brew --prefix 2>/dev/null)/Caskroom/gcloud-cli/latest/google-cloud-sdk/path.bash.inc" \
             "$HOME/google-cloud-sdk/path.bash.inc"; do
    [ -f "$inc" ] && source "$inc" && return 0
  done
  return 1
}
command -v gcloud >/dev/null 2>&1 || load_gcloud_path
if ! command -v gcloud >/dev/null 2>&1; then
  if [ $HAVE_BREW = 1 ]; then
    info "Installiere gcloud über Homebrew …"
    brew install --cask gcloud-cli || brew install --cask google-cloud-sdk || die "gcloud-Installation fehlgeschlagen."
  else
    info "Kein Homebrew gefunden, nutze den offiziellen Installer nach ~/google-cloud-sdk …"
    curl -fsSL https://sdk.cloud.google.com | bash -s -- --disable-prompts --install-dir="$HOME" \
      || die "gcloud-Installation fehlgeschlagen."
    for rc in "$HOME/.zshrc" "$HOME/.bash_profile"; do
      grep -q 'google-cloud-sdk/path' "$rc" 2>/dev/null || {
        shell_ext=bash; [ "${rc##*.}" = "zshrc" ] && shell_ext=zsh
        printf '\n# Google Cloud SDK\nsource "$HOME/google-cloud-sdk/path.%s.inc"\n' "$shell_ext" >> "$rc"
      }
    done
  fi
  command -v gcloud >/dev/null 2>&1 || load_gcloud_path
  command -v gcloud >/dev/null 2>&1 || die "gcloud installiert, aber nicht im PATH. Neues Terminal öffnen und Skript erneut starten."
fi
ok "$(gcloud --version 2>/dev/null | head -1)"

# ---------------------------------------------------------------------------
bold "3/11  Anmeldung bei Google"
ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | head -1)"
if [ -z "$ACCOUNT" ]; then
  info "Gleich öffnet sich dein Browser. Bitte mit deinem Google-Konto (dem mit Google AI Pro) anmelden und bestätigen."
  gcloud auth login || die "Anmeldung abgebrochen."
  ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -1)"
fi
ok "gcloud angemeldet als $ACCOUNT"

if gcloud auth application-default print-access-token >/dev/null 2>&1; then
  ok "Application Default Credentials vorhanden"
else
  info "Noch einmal im Browser bestätigen (Zugang für Python-Programme, Application Default Credentials)."
  gcloud auth application-default login || die "ADC-Anmeldung abgebrochen."
  ok "Application Default Credentials eingerichtet"
fi

# ---------------------------------------------------------------------------
bold "4/11  Projekt anlegen"
PROJECT=""
candidate="$PROJECT_BASE"
for attempt in 1 2 3 4 5; do
  if labels="$(gcloud projects describe "$candidate" --format='value(labels)' 2>/dev/null)"; then
    if [[ "$labels" == *"created-by=nano-banana-setup"* ]]; then
      PROJECT="$candidate"; ok "Projekt '$PROJECT' existiert schon (von diesem Setup), nutze es weiter."; break
    fi
    info "'$candidate' ist ein bestehendes Projekt, das ich nicht verändere. Nehme einen anderen Namen."
  elif gcloud projects create "$candidate" --name="Jonis Bilder" --labels="$PROJECT_LABEL" >/dev/null 2>&1; then
    PROJECT="$candidate"; ok "Projekt '$PROJECT' angelegt."; break
  else
    info "Projekt-ID '$candidate' ist vergeben."
  fi
  candidate="$PROJECT_BASE-$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 5)"
done
[ -n "$PROJECT" ] || die "Konnte kein Projekt anlegen. Ausgabe von 'gcloud projects create $candidate' prüfen."

gcloud config set project "$PROJECT" >/dev/null 2>&1 && ok "Standardprojekt: $PROJECT"

# ---------------------------------------------------------------------------
bold "5/11  Billing-Konto verknüpfen"
if [ "$(gcloud billing projects describe "$PROJECT" --format='value(billingEnabled)' 2>/dev/null)" = "True" ]; then
  BILLING_ACCOUNT="$(gcloud billing projects describe "$PROJECT" --format='value(billingAccountName)' | sed 's#billingAccounts/##')"
  ok "Billing ist schon verknüpft ($BILLING_ACCOUNT)"
else
  ACCOUNTS=()
  while IFS= read -r line; do [ -n "$line" ] && ACCOUNTS+=("$line"); done \
    < <(gcloud billing accounts list --filter='open=true' --format='value(name.basename(),displayName)' 2>/dev/null)
  case ${#ACCOUNTS[@]} in
    0) die "Kein offenes Billing-Konto gefunden. Öffne https://console.cloud.google.com/billing und prüfe, ob deine Google-AI-Pro-Credits aktiviert sind (Google Developer Program: https://developers.google.com/profile/benefits). Danach Skript erneut starten." ;;
    1) BILLING_ACCOUNT="$(printf '%s' "${ACCOUNTS[0]}" | cut -f1)"
       info "Ein Billing-Konto gefunden: ${ACCOUNTS[0]//$'\t'/  }" ;;
    *) info "Mehrere Billing-Konten gefunden:"
       i=1; for a in "${ACCOUNTS[@]}"; do printf '     %d) %s\n' "$i" "${a//$'\t'/  }"; i=$((i+1)); done
       while :; do
         choice="$(ask "Welches Konto soll das Projekt nutzen? Nummer eingeben:")"
         [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#ACCOUNTS[@]} ] && break
         warn "Bitte eine Zahl von 1 bis ${#ACCOUNTS[@]} eingeben."
       done
       BILLING_ACCOUNT="$(printf '%s' "${ACCOUNTS[$((choice-1))]}" | cut -f1)" ;;
  esac
  gcloud billing projects link "$PROJECT" --billing-account="$BILLING_ACCOUNT" >/dev/null \
    || die "Verknüpfung fehlgeschlagen. Manuell: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT"
  ok "Billing-Konto $BILLING_ACCOUNT verknüpft"
fi

# ---------------------------------------------------------------------------
bold "6/11  APIs aktivieren"
gcloud services enable aiplatform.googleapis.com billingbudgets.googleapis.com --project="$PROJECT" \
  || die "APIs konnten nicht aktiviert werden."
ok "aiplatform.googleapis.com und billingbudgets.googleapis.com aktiv"

if gcloud auth application-default set-quota-project "$PROJECT" >/dev/null 2>&1; then
  ok "Quota-Projekt für Application Default Credentials: $PROJECT"
else
  warn "Quota-Projekt konnte nicht gesetzt werden. Später manuell: gcloud auth application-default set-quota-project $PROJECT"
fi

# ---------------------------------------------------------------------------
bold "7/11  Budget-Schutz (10 USD, Warnungen bei 50/90/100 %)"
BUDGET_CONSOLE="https://console.cloud.google.com/billing/$BILLING_ACCOUNT/budgets"
existing="$(gcloud billing budgets list --billing-account="$BILLING_ACCOUNT" --billing-project="$PROJECT" \
  --format='value(displayName)' 2>/dev/null | grep -Fx "$BUDGET_NAME" || true)"
if [ -n "$existing" ]; then
  ok "Budget '$BUDGET_NAME' existiert schon"
else
  # exclude-all-credits: Budget misst die Bruttokosten, also den Verbrauch der Gutschrift.
  # Mit Gutschriften gerechnet stünde es sonst immer bei 0 und würde nie warnen.
  create_budget() {
    gcloud billing budgets create --billing-account="$BILLING_ACCOUNT" --billing-project="$PROJECT" \
      --display-name="$BUDGET_NAME" --budget-amount="$1" \
      --filter-projects="projects/$PROJECT" --credit-types-treatment=exclude-all-credits \
      --calendar-period=month \
      --threshold-rule=percent=0.5 --threshold-rule=percent=0.9 --threshold-rule=percent=1.0 >/dev/null
  }
  if create_budget 10USD 2>/tmp/nano-banana-budget.err; then
    ok "Budget 10 USD angelegt (E-Mail-Warnungen gehen an die Billing-Admins, also an dich)"
  elif grep -qi currency /tmp/nano-banana-budget.err && create_budget 10 2>>/tmp/nano-banana-budget.err; then
    warn "Dein Billing-Konto rechnet nicht in USD. Budget mit 10 in Kontowährung angelegt."
  else
    warn "Budget per CLI nicht möglich: $(tail -1 /tmp/nano-banana-budget.err)"
    cat <<EOF
     So stellst du es in der Konsole ein:
       1. Öffne $BUDGET_CONSOLE
       2. "Budget erstellen" klicken, Name: $BUDGET_NAME
       3. Projekte: nur "$PROJECT" auswählen
       4. Gutschriften: Haken bei allen Gutschriften ENTFERNEN (damit der Verbrauch sichtbar ist)
       5. Betrag: 10 USD, Zeitraum monatlich
       6. Schwellenwerte: 50 %, 90 %, 100 % (tatsächliche Kosten), E-Mail an Billing-Admins
       7. Speichern
EOF
  fi
fi

# ---------------------------------------------------------------------------
bold "8/11  Python-Paket google-genai"
mkdir -p "$SKILL_DIR"
[ -x "$SKILL_DIR/.venv/bin/python" ] || python3 -m venv "$SKILL_DIR/.venv" || die "venv konnte nicht erstellt werden."
"$SKILL_DIR/.venv/bin/python" -m pip install -q --upgrade pip >/dev/null 2>&1
"$SKILL_DIR/.venv/bin/python" -m pip install -q --upgrade google-genai || die "pip install google-genai fehlgeschlagen."
ok "google-genai $("$SKILL_DIR/.venv/bin/python" -c 'import google.genai as g; print(g.__version__)') in $SKILL_DIR/.venv"

# ---------------------------------------------------------------------------
bold "9/11  Skill-Dateien schreiben"
write_skill_files() {
  local here; here="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)"
  if [ -n "$here" ] && [ -f "$here/nano_banana.py" ] && [ -f "$here/SKILL.md" ]; then
    cp "$here/nano_banana.py" "$SKILL_DIR/nano_banana.py"
    cp "$here/SKILL.md" "$SKILL_DIR/SKILL.md"
  else
    die "nano_banana.py und SKILL.md nicht gefunden. Nutze install-nano-banana.sh oder starte setup.sh aus seinem Ordner."
  fi
}
write_skill_files
chmod +x "$SKILL_DIR/nano_banana.py"
printf '{\n  "project": "%s",\n  "location": "global"\n}\n' "$PROJECT" > "$SKILL_DIR/config.json"
cat > "$SKILL_DIR/nano-banana" <<'EOF'
#!/usr/bin/env bash
# Startet nano_banana.py mit der Python-Umgebung des Skills.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/.venv/bin/python" "$DIR/nano_banana.py" "$@"
EOF
chmod +x "$SKILL_DIR/nano-banana"
ok "Skript:  $SKILL_DIR/nano_banana.py"
ok "Skill:   $SKILL_DIR/SKILL.md"
ok "Config:  $SKILL_DIR/config.json (Projekt $PROJECT)"

# ---------------------------------------------------------------------------
bold "10/11  Testbild erzeugen (ca. 0,13 \$)"
mkdir -p "$TEST_DIR"
PIZZA="$TEST_DIR/test_pizza.png"
PIZZA_DARK="$TEST_DIR/test_pizza_dunkel.png"
open_img() { if command -v open >/dev/null 2>&1; then open "$1"; else info "Bild: $1"; fi; }

if "$SKILL_DIR/nano-banana" "Neapolitanische Pizza Margherita frisch aus dem Holzofen, Abendlicht, Food-Fotografie" -o "$PIZZA"; then
  ok "Testbild erstellt"; open_img "$PIZZA"
  bold "11/11  Bearbeitung testen (ca. 0,13 \$)"
  if "$SKILL_DIR/nano-banana" "mach den Hintergrund dunkler" -i "$PIZZA" -o "$PIZZA_DARK"; then
    ok "Bearbeitung erstellt"; open_img "$PIZZA_DARK"
  else
    warn "Bearbeitungstest fehlgeschlagen (Meldung oben)."
  fi
else
  warn "Testbild fehlgeschlagen (Meldung oben). Häufigste Ursache: Billing oder API brauchen 1 bis 2 Minuten. Später erneut testen mit:"
  info "~/.claude/skills/nano-banana/nano-banana \"Pizza Margherita, Food-Fotografie\" -o ~/bilder/test.png"
fi

# ---------------------------------------------------------------------------
bold "Fertig 🎉"
cat <<EOF
  Projekt:        $PROJECT  (Billing-Konto $BILLING_ACCOUNT)
  Skill:          $SKILL_DIR
  Testbilder:     $TEST_DIR
  Guthaben:       https://console.cloud.google.com/billing/$BILLING_ACCOUNT/credits
  Kosten/Budget:  $BUDGET_CONSOLE

  In Claude Code (beliebiges Projekt) einfach sagen, z. B.:
    "Erstell mir ein Instagram-Bild von unserer Pizza im 4:5-Format"
    "Mach auf foto.jpg den Hintergrund heller"
EOF
