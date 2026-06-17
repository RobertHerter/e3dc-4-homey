---
name: e3dc-homey
description: >
  Workflow für die Homey-App e3dc-4-homey (de.jnkconsulting.e3dc.v2, Fork Copiis).
  Liest PROJEKT-REGELN.md, erkennt Book vs. Arctic, baut auf Book ohne Auto-Install.
  Use when working on e3dc, E3DC, Homey app, wallbox, RSCP, Hauskraftwerk,
  homey app publish, Athom Test-Build, or when the user runs /e3dc-homey.
metadata:
  short-description: "e3dc-4-homey Build & Deploy Workflow (Book)"
---

# e3dc-homey — Build & Deploy (Book)

Standard-Workflow für das Repository **e3dc-4-homey** auf Book (und Arctic zum Vergleich).

## Session-Start (immer)

1. **Rechner erkennen:** `hostname` oder `$HOME` → `book` oder `arctic`.
2. **Repo-Pfad setzen:**
   - **Book (Standard hier):** `/home/book/projects/e3dc-4-homey`
   - Arctic: `/home/arctic/Projekte/e3dc-4-homey`
3. **`PROJEKT-REGELN.md` lesen** — enthält aktuellen Stand, Deploy-Regeln, Forum-Format. Lokal, nicht im Git (Syncthing zwischen Rechnern).
4. **Repo-`AGENTS.md`** für Kurzregeln lesen.

## Nach App-Code-Änderungen

### Schritt 1 — Backup

Vor der Änderung ein Backup mit sprechendem Namen anlegen (Projekt-Konvention in `PROJEKT-REGELN.md`).

### Schritt 2 — Build

```bash
cd /home/book/projects/e3dc-4-homey
source ~/.nvm/nvm.sh 2>/dev/null; nvm use
npm run build
```

Build muss grün sein, bevor weiter deployed oder committed wird.

### Schritt 3 — Deploy (rechnerabhängig)

| Rechner | Aktion |
|---------|--------|
| **book** | **Nur Build** — kein `homey app install`. Standard: Nutzer sagt push/publish, oder Athom Test-URL |
| **arctic** | `./install-local-homey.sh` automatisch nach App-Änderungen |

**Warum kein lokales Install auf Book:** Homey CLI ist nur auf Arctic eingerichtet (`192.168.188.62`).

**Typischer Book-Workflow nach Änderung:**

1. Build grün
2. Auf Kommando: commit → push
3. Auf Arctic (oder per Athom): publish → Portal Test freigeben
4. Installation über Test-URL oder Portal INSTALL

### Schritt 4 — Kurz berichten

Was geändert wurde, Build-Status, nächster Schritt (z. B. „bereit für commit/push“).

## Nur auf explizites Kommando

| Nutzer sagt | Aktion |
|-------------|--------|
| **commit / git** | Version in `package.json`, `.homeycompose/app.json`, `app.json` + `.homeychangelog.json` (DE+EN) → `npm run build` → `git add -u` → `git commit` |
| **push / GitHub** | `git push origin master` |
| **publish / Athom / Test** | Auf **Arctic** (CLI): `homey app validate --level publish` → `homey app publish` (Version bump: **n**) → Nutzer gibt Test im Portal frei. Von Book aus: push, dann Arctic-Publish anstoßen oder Nutzer bitten. |
| **lokal / installieren** | Athom Test-URL oder Portal INSTALL — kein `homey app install` auf Book |
| **Forum-Post** | Deutsch, Discourse-Format — siehe `PROJEKT-REGELN.md` § Forum-Text |

**Nie automatisch:** commit, push, publish, Version bump, Forum-Post, lokales Install.

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
- Grok-Regeln aktualisieren: `./setup/grok/install.sh`