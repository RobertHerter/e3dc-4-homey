# Globale Agent-Regeln (Book)

Diese Datei gilt für **alle** Grok-Sessions auf diesem Rechner, unabhängig vom Arbeitsverzeichnis.

## Rechner-Erkennung

| Rechner | Erkennung | Home-Verzeichnis |
|---------|-----------|------------------|
| **book** | Hostname enthält `book` | `/home/book` |
| **arctic** | Hostname enthält `arctic` | `/home/arctic` |

Prüfe zu Sessionbeginn: `hostname` oder `$HOME`.

## e3dc-4-homey (Hauptprojekt)

| Was | Book | Arctic |
|-----|------|--------|
| **Repo-Pfad** | `/home/book/projects/e3dc-4-homey` | `/home/arctic/Projekte/e3dc-4-homey` |
| **Lokales Homey-Update** | **Nie** automatisch — nur auf Kommando | **Automatisch** nach App-Code-Änderungen |
| **Homey CLI** | Nicht eingerichtet | Eingeloggt, Ziel `192.168.188.62` |

**Vor jeder e3dc-Session:** `PROJEKT-REGELN.md` und `AGENTS.md` im Repo lesen (beide lokal, nicht im Git; Syncthing zwischen Book und Arctic).

**Skill:** Bei e3dc-/Homey-Arbeit den Skill `e3dc-homey` laden (`/e3dc-homey`).

### Book — Kein Auto-Deploy

Auf Book nach App-Code-Änderungen:

1. Backup (sprechender Name)
2. `npm run build` (Build muss grün sein)
3. **Kein** `homey app install` — Homey CLI ist hier nicht eingerichtet

**Standard-Deploy-Weg von Book:** `git push` → auf Arctic (oder per Athom-Publish) Test-Build → Portal INSTALL oder Test-URL.

### Nur auf explizites Kommando (beide Rechner)

- `git commit` / `git push`
- `homey app publish` / Athom Test-Build (praktisch nur auf Arctic mit CLI)
- Version bump + `.homeychangelog.json`
- Forum-Post im Homey-Community-Thread
- Lokales Install nur wenn Nutzer es **explizit** verlangt (auf Book: Athom-Weg empfehlen)

### Grok-Umgebung (Book)

- Grok-Regeln installieren: `./setup/grok/install.sh` (einmalig oder nach Updates)
- Node v24 via `nvm` (`.nvmrc` im Projekt)

## Allgemein

- Befehle selbst ausführen, nicht nur Anweisungen geben.
- Keine Credentials, Tokens oder `.bak`-Dateien committen.
- Antworten auf Deutsch, wenn der Nutzer Deutsch schreibt.