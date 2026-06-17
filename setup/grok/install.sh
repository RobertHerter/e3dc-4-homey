#!/bin/bash
# Grok-Regeln (AGENTS.md + e3dc-homey Skill) nach ~/.grok/ installieren.
# Erkennt Arctic vs. Book automatisch. Liegt im Syncthing-Repo — auf beiden Rechnern nutzbar.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

detect_machine() {
  local hn
  hn="$(hostname)"
  if [[ "$hn" == *arctic* ]] || [[ "$HOME" == /home/arctic ]]; then
    echo arctic
  elif [[ "$hn" == *book* ]] || [[ "$HOME" == /home/book ]]; then
    echo book
  else
    echo "Unbekannter Rechner (hostname=$(hostname), HOME=$HOME)" >&2
    echo "Erwartet: arctic oder book." >&2
    exit 1
  fi
}

MACHINE="$(detect_machine)"
SRC="$SCRIPT_DIR/$MACHINE"

if [[ ! -f "$SRC/AGENTS.md" ]]; then
  echo "Fehler: $SRC/AGENTS.md nicht gefunden." >&2
  exit 1
fi

mkdir -p "$HOME/.grok/skills/e3dc-homey"
cp "$SRC/AGENTS.md" "$HOME/.grok/AGENTS.md"
cp "$SRC/skills/e3dc-homey/SKILL.md" "$HOME/.grok/skills/e3dc-homey/SKILL.md"

echo "✅ Grok-Regeln für $MACHINE installiert:"
echo "   $HOME/.grok/AGENTS.md"
echo "   $HOME/.grok/skills/e3dc-homey/SKILL.md"