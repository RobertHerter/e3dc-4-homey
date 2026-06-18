# Globale Agent-Regeln (Arctic)

Diese Datei gilt für **alle** Grok-Sessions auf diesem Rechner, unabhängig vom Arbeitsverzeichnis.

## Rechner-Erkennung

| Rechner | Erkennung | Home-Verzeichnis |
|---------|-----------|------------------|
| **arctic** | Hostname enthält `arctic` | `/home/arctic` |
| **book** | Hostname enthält `book` | `/home/book` |

Prüfe zu Sessionbeginn: `hostname` oder `$HOME`.

## e3dc-4-homey (Hauptprojekt)

| Was | Arctic | Book |
|-----|--------|------|
| **Repo-Pfad** | `/home/arctic/Projekte/e3dc-4-homey` | `/home/book/projects/e3dc-4-homey` |
| **Lokales Homey-Update** | **Automatisch** nach App-Code-Änderungen | **Nie** automatisch — nur auf Kommando |
| **Homey CLI** | Eingeloggt, Ziel `192.168.188.62` | Nicht eingerichtet |

**Vor jeder e3dc-Session:** `PROJEKT-REGELN.md` und `AGENTS.md` im Repo lesen (beide lokal, nicht im Git; Syncthing zwischen Arctic und Book).

**Skill:** Bei e3dc-/Homey-Arbeit den Skill `e3dc-homey` laden (`/e3dc-homey`).

### Arctic — Auto-Deploy (ohne Nachfrage)

Nach nutzerrelevanten **App-Code-Änderungen** auf Arctic:

1. Backup (sprechender Name)
2. `npm run build` → bei Erfolg `./install-local-homey.sh` (oder `homey app install`)

### Nur auf explizites Kommando (beide Rechner)

- `git commit` / `git push`
- `homey app publish` / Athom Test-Build
- Version bump + `.homeychangelog.json`
- Forum-Post im Homey-Community-Thread

### Grok-Umgebung (Arctic)

- `permission_mode = "always-approve"` in `~/.grok/config.toml` — Shell-Befehle ohne Nachfrage
- `gh` als Copiis eingeloggt; Homey CLI als `copiis@vivaldi.net`
- Node v24 via `nvm` (`.nvmrc` im Projekt)

## Allgemein

- Befehle selbst ausführen, nicht nur Anweisungen geben.
- Keine Credentials, Tokens oder `.bak`-Dateien committen.
- Antworten auf Deutsch, wenn der Nutzer Deutsch schreibt.