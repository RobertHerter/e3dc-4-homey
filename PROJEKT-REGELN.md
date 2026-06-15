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

## Deployment (Homey)

- **App auf den Homey**, wenn ausdrücklich gewünscht oder nach Repo-Upload mit gleicher Bitte.
- Standardbefehl:
  ```bash
  npm run build && homey app install
  ```
- Ziel-Homey: **Homey** (`192.168.188.62`), eingeloggt als `copiis@vivaldi.net`.
- Nach Installation kurz prüfen, ob Version und Verhalten auf dem Gerät stimmen (Wallbox-Kachel, HPS-Poll, Flow-Karten).

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
- Laden + Sonnenmodus: **`wallbox_charging`** und **`wallbox_sun_mode`**, beide `uiComponent: "button"`, `uiQuickAction: true` — **gleiche Seite**, kein Dropdown, kein Extra-Tab.
- **`evcharger_charging` nicht verwenden** — belegt die Haupt-EV-Ansicht; weitere Controls landen dann auf einer zweiten Seite.
- Keine zwei `toggle`-Capabilities — Homey macht daraus ein Dropdown.

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