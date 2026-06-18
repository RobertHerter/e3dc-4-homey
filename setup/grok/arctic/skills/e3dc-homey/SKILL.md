---
name: e3dc-homey
description: >
  Workflow für die Homey-App e3dc-4-homey (de.jnkconsulting.e3dc.v2, Fork Copiis).
  Liest PROJEKT-REGELN.md, erkennt Arctic vs. Book, baut und deployed auf Arctic
  automatisch lokal. Use when working on e3dc, E3DC, Homey app, wallbox, RSCP,
  Hauskraftwerk, install-local-homey, homey app install/publish, or when the user
  runs /e3dc-homey.
metadata:
  short-description: "e3dc-4-homey Build & Deploy Workflow"
---

# e3dc-homey — Build & Deploy

Standard-Workflow für das Repository **e3dc-4-homey** auf Arctic und Book.

## Session-Start (immer)

1. **Rechner erkennen:** `hostname` oder `$HOME` → `arctic` oder `book`.
2. **Repo-Pfad setzen:**
   - Arctic: `/home/arctic/Projekte/e3dc-4-homey`
   - Book: `/home/book/projects/e3dc-4-homey`
3. **`PROJEKT-REGELN.md` lesen** — enthält aktuellen Stand, Deploy-Regeln, Forum-Format. Lokal, nicht im Git (Syncthing zwischen Rechnern).
4. **`AGENTS.md` lesen** — Kurzregeln (Deploy, Flow-Konvention). Lokal, nicht im Git (Syncthing).

## Nach App-Code-Änderungen

### Schritt 1 — Backup

Vor der Änderung ein Backup mit sprechendem Namen anlegen (Projekt-Konvention in `PROJEKT-REGELN.md`).

### Schritt 2 — Build

```bash
cd <REPO>
source ~/.nvm/nvm.sh 2>/dev/null; nvm use
npm run build
```

Build muss grün sein, bevor weiter deployed oder committed wird.

### Schritt 3 — Lokales Homey (rechnerabhängig)

| Rechner | Aktion |
|---------|--------|
| **arctic** | **Automatisch** ohne Nachfrage: `./install-local-homey.sh` |
| **book** | **Nicht** ausführen — CLI nicht eingerichtet; nur auf Kommando Hinweis auf Athom-Weg |

`install-local-homey.sh` macht: `npm run build` + `homey app install` → Ziel `192.168.188.62`.

### Schritt 4 — Kurz berichten

Nach Deploy: Version, was geändert wurde, ob Install erfolgreich war.

## Nur auf explizites Kommando

| Nutzer sagt | Aktion |
|-------------|--------|
| **commit / git** | Version in `package.json`, `.homeycompose/app.json`, `app.json` + `.homeychangelog.json` (DE+EN) → `npm run build` → `git add -u` → `git commit` |
| **push / GitHub** | `git push origin master` |
| **publish / Athom / Test** | `homey app validate --level publish` → `homey app publish` (CLI Version bump: **n**) → Nutzer gibt Test im Portal frei |
| **lokal / installieren** (Book) | Nur Build; Athom Test-URL oder Portal INSTALL empfehlen |
| **Forum-Post** | Deutsch, Discourse-Format — siehe `PROJEKT-REGELN.md` § Forum-Text |

**Nie automatisch:** commit, push, publish, Version bump, Forum-Post.

## Athom Test-URL (für Tester)

```
https://homey.app/de-de/app/de.jnkconsulting.e3dc.v2/E3DC---HKW/test/
```

Im Forum immer nur **eine** aktuelle Testversion nennen — keine Build-Nummern-Listen.

## Wichtige Constraints

- Minimaler Diff; TypeScript-Build vor jedem Deploy.
- Keine Credentials, keine `.bak`-Dateien committen.
- `homey app validate --level publish` vor Athom-Publish.
- Node v24+ (`nvm use`, `.nvmrc`).
- Bei „Too many requests“ beim Publish: 15–60 Min. warten, nicht spam-publishen.

## Referenzen

- Remote: `https://github.com/Copiis/e3dc-4-homey.git`, Branch `master`
- Forum: https://community.homey.app/t/app-pro-e3dc-hauskraftwerke/105181
- Doku: https://copiis.github.io/e3dc-4-homey/