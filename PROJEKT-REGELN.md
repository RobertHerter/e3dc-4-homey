# Projekt-Regeln – e3dc-4-homey

Diese Datei gilt für alle Arbeiten an diesem Repository (Fork **Copiis**, App `de.jnkconsulting.e3dc.v2`).

## Upload (Begriffe)

| Nutzer sagt | Bedeutung |
|-------------|-----------|
| **„upload“** (allein) | Änderungen ins **Git-Repo** bringen: `git add` → `git commit` → `git push origin master` |
| **„upload“** + Homey / App / installieren | Zusätzlich App auf den **Homey** deployen (siehe unten) |
| Explizit **Homey / App installieren** | Nur Gerät, kein Git nötig |

### Repo-Upload (bei „upload“)

```bash
cd /home/arctic/Projekte/e3dc-4-homey
npm run build
git add -A
git commit -m "<kurze Beschreibung>"
git push origin master
```

- Remote: `https://github.com/Copiis/e3dc-4-homey.git`
- Vor dem Commit: Build muss fehlerfrei sein; keine Credentials in `env.json` o. Ä.
- **Node.js v22+** (`nvm use` liest `.nvmrc`) — entspricht Homey-CLI-Anforderung.

## Release-Ablauf (immer in dieser Reihenfolge)

1. **Lokal testen** auf dem eigenen Homey — **immer zuerst**, vor Git-Push und vor Store-Publish.
2. **Git** — erst nach erfolgreichem Lokaltest committen/pushen.
3. **Store** — Test-Publish oder Live nur nach Lokaltest; Forum erst nach Test-Publish.

```bash
# Schritt 1 — Lokaltest (Pflicht)
cd /home/arctic/Projekte/e3dc-4-homey
nvm use
npm run build && homey app install
# → Wallbox-Kachel, HPS-Poll, Flow-Karten am Gerät prüfen

# Schritt 2 — Repo (nach OK)
git add -A && git commit -m "..." && git push origin master

# Schritt 3 — Store (nach OK)
homey app validate --level publish
homey app publish
# → im Developer Portal: Test, danach ggf. Live
```

## Deployment (Homey)

- **App auf den Homey** = Schritt 1 des Release-Ablaufs (`homey app install`), nicht optional vor einem Publish.
- Ziel-Homey: **Homey** (`192.168.188.62`), eingeloggt als `copiis@vivaldi.net`.
- `homey app run -r` nur für Live-Debugging; für dauerhaften Test **`homey app install`** verwenden.

## Version & Manifest

- Version in `package.json`, `.homeycompose/app.json` und `app.json` **gemeinsam** erhöhen.
- Eintrag in `.homeychangelog.json` (DE + EN) bei jeder nutzerrelevanten Änderung.
- Compose-Dateien (`.homeycompose/`, `drivers/*/driver.compose.json`) sind die Quelle; `app.json` bei Bedarf mit anpassen.
- `energy.evCharger` / erweiterte Wallbox-Features: `compatibility >= 12.4.5`.

## Code & Architektur

- Nur den **minimalen** Diff für die Aufgabe; keine Drive-by-Refactors.
- TypeScript bauen (`npm run build`) vor jedem Upload.
- RSCP-Logik in `src/rscp-api.ts` und Convertern; Geräte-Logik in `drivers/*/device.ts`.
- Wallbox-Status aus **Rücklesen** (`REQ_EXTERN_DATA_ALG`), nicht nur aus Set-Befehlen.
- E3/DC-Credentials und Passwörter **nie** ins Repo committen.

## Wallbox-UI (Homey)

- Geräteklasse: `evcharger`.
- **Kachel:** `wallbox_charging` und `wallbox_sun_mode` nur **Status** (`setable: false`, `uiComponent: sensor`) — Rücklesen vom HPS-Poll.
- **Steuerung:** Flow-DANN-Karten mit RSCP-Rücklesen — `wallbox_allow_charging`, `wallbox_block_charging`, `wallbox_sun_mode_on`, `wallbox_sun_mode_off`.
- **Vorbedingung (WENN):** `wallbox_sun_mode_is_off` / `_is_active`, `wallbox_charging_is_blocked` / `_is_allowed` — liest Kachel-Sensor, damit Folgekarten (Benachrichtigung) nicht laufen wenn schon im Zustand.
- **`evcharger_charging` nicht verwenden** — belegt die Haupt-EV-Ansicht.

## Dokumentation

- Geräte- und RSCP-Details: `doku/docs/devices/`.
- Neue Capabilities und Flow-Karten dort kurz ergänzen, wenn Verhalten für Nutzer sichtbar ändert.

## Sprache

- Commit-/Changelog-Texte: **DE + EN**.
- Kommunikation mit dem Projektinhaber: **Deutsch**, sofern nicht anders gewünscht.

## Sicherheit & Tests

- Keine produktiven IP-Adressen oder Zugangsdaten in Logs committen.
- Gegen echte Hardware testen, wenn RSCP/Wallbox betroffen ist (Debug-Modus am HPS-Gerät optional).
- Bei Fehlern: `homey app validate` und Homey-App-Logs am Gerät prüfen.