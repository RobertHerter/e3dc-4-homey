# Projekt-Regeln – e3dc-4-homey

Diese Datei gilt für alle Arbeiten an diesem Repository (Fork **Copiis**, App `de.jnkconsulting.e3dc.v2`).

## Community

- Forum-Thread: [App für E3DC Hauskraftwerke](https://community.homey.app/t/app-pro-e3dc-hauskraftwerke/105181)
- Nach Test-Publish: Changelog + Test-Link im Thread posten; auf Nutzer-Feedback warten vor Live-Release.

## Upload (Begriffe)

| Nutzer sagt | Bedeutung |
|-------------|-----------|
| **„upload“** (allein) | Wie **AI-Pflicht nach Code-Änderung** (Git + Athom + lokal) |
| Explizit **nur Git** | Nur `git push`, kein Athom |
| Explizit **nur lokal / installieren** | Nur `homey app install`, kein Git/Athom |

### AI-Pflicht nach jeder Code-Änderung (automatisch)

**Nach jeder relevanten Änderung** am App-Code — ohne extra User-Befehl — in dieser Reihenfolge:

1. Backup (vor der Änderung, sprechender Name)
2. Version bump + `.homeychangelog.json` (DE + EN)
3. `homey app build` (Compose → `app.json`, TypeScript)
4. `homey app install` auf Homey `192.168.188.62`
5. `git add -A` → `git commit` → `git push origin master`
6. `homey app validate --level publish` → `homey app publish` (Version **nicht** erneut bumpen: `n` auf CLI-Frage)

**Athom Developer Portal (User, manuell):** Build im Portal als **Test** freigeben — Live erst nach Forum-Feedback.

```bash
cd /home/arctic/Projekte/e3dc-4-homey
nvm use
homey app build
homey app install
git add -A && git commit -m "vX.Y.Z: …" && git push origin master
homey app validate --level publish
printf 'n\n' | homey app publish
# → Link aus CLI: tools.developer.homey.app → Build als Test aktivieren
```

- Remote: `https://github.com/Copiis/e3dc-4-homey.git`
- Vor Commit/Publish: Build + `validate --level publish` müssen grün sein; keine Credentials committen.
- **Node.js v22+** (`nvm use` liest `.nvmrc`)
- Kurz in der Antwort: Version, Git-Commit, Athom-Build-Link, Hinweis „Test im Portal freigeben“

### Manueller Release-Ablauf (Referenz)

1. **Lokal** — `homey app install`
2. **Git** — commit + push
3. **Athom** — `homey app publish` → Portal: Test (User bestätigt), später ggf. Live + Forum

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
- **Kachel:** `measure_power` (Leistung), `measure_wallbox_solarshare`, `wallbox_charging` und `wallbox_sun_mode` — letztere nur **Status** (`setable: false`, `uiComponent: sensor`); kein `measure_wallbox_consumption` am Wallbox-Gerät (nur am HPS für Summen).
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