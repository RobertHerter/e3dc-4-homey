# Projekt-Regeln – e3dc-4-homey

Diese Datei gilt für alle Arbeiten an diesem Repository (Fork **Copiis**, App `de.jnkconsulting.e3dc.v2`).

## Community

- Forum-Thread: [App für E3DC Hauskraftwerke](https://community.homey.app/t/app-pro-e3dc-hauskraftwerke/105181)
- Nach Test-Publish: Changelog + Test-Link im Thread posten; auf Nutzer-Feedback warten vor Live-Release.

### Athom Test-Builds (für Tester & Forum)

- Freigegebene **Test-Builds** hängen am **Stable**-Kanal; die Install-URL endet mit **`/test/`** (nicht die Live-Store-URL ohne Suffix).
- **Standard-Link für Tester:**
  `https://homey.app/de-de/app/de.jnkconsulting.e3dc.v2/E3DC---HKW/test/`
- Developer-Portal (`tools.developer.homey.app/.../build/XX`) nur intern zum Freigeben — im Forum **nicht** mehrere Build-Nummern nennen.
- **Immer nur den letzten Test-Build erwähnen** — nie mehrere Versionen oder Build-IDs auflisten (z. B. nicht „v1.4.15 und v1.4.16“); sonst verwirrend. Ältere Test-Hinweise im Thread nicht wiederholen.

### Forum-Text (AI)

Wenn die AI einen **Forum-Beitrag** vorschliefert oder formuliert, muss der Text **forumsgerecht** formatiert sein — direkt kopierbar in den [Homey-Community-Thread](https://community.homey.app/t/app-pro-e3dc-hauskraftwerke/105181) (Discourse), nicht als interne Dev-Notiz oder Chat-Antwort.

**Format:**

- **Sprache:** Deutsch (wie der Thread).
- **Struktur:** Kurzer Einstieg (1–2 Sätze) → **Änderungen in vX.Y.Z** als Aufzählung → Test-Hinweis mit Link → optional kurze Bitte um Rückmeldung.
- **Markdown:** Nur was Discourse gut darstellt — `**fett**`, Aufzählungen (`-`), Absätze, `[Linktext](URL)`. Keine Tabellen, keine Mermaid-/ASCII-Diagramme, keine Code-Zitationen mit Dateipfaden.
- **Technik:** Capability-IDs und Versionsnummern in `` `backticks` ``; **ein** Test-Link (Stable + `/test/`, siehe oben) — keine Auflistung älterer Builds.
- **Länge:** Kompakt und scannbar; keine langen Erklärblockaden — Details gehören ins Changelog oder in die Doku.
- **Tonalität:** Sachlich, freundlich, Community-Niveau — kein „internes“ Protokoll (Commit-Hash, Portal-Schritte für den Maintainer) im Forentext, außer der Tester braucht den Build-Link.

**Beispiel-Skelett:**

```
Kurzer Dank / Kontext zu Nutzer-Feedback.

**Änderungen in v1.4.16 (Test):**
- Punkt 1
- Punkt 2

Testversion (aktuellster Build): https://homey.app/de-de/app/de.jnkconsulting.e3dc.v2/E3DC---HKW/test/

Bitte kurz Rückmeldung, ob …
```

## Upload & Deployment (Begriffe)

### Grundregel nach Code-Änderungen

**Nach Code-Verbesserungen nichts automatisch deployen.** Die AI wartet auf dein Kommando, bevor etwas auf einen Homey, nach GitHub oder zu Athom geht.

**Automatisch (ohne Nachfrage) nur:**

1. Backup vor der Änderung (sprechender Name)

**Erst auf explizites Kommando:**

| Du sagst | Was passiert |
|----------|--------------|
| **Lokal / installieren / upload** | `homey app build` → `homey app install` auf `192.168.188.62` |
| **Git / commit** | Version bump + `.homeychangelog.json` (DE + EN) → `homey app build` → `git add -u` → `git commit` |
| **GitHub / git push / remote** | `git push origin master` (ggf. vorher commit, falls noch nicht geschehen) |
| **Athom / publish / Test hochladen** | `homey app validate --level publish` → `homey app publish` (+ Portal: Test freigeben) |

Kombinationen sind möglich (z. B. erst commit, dann publish) — immer in der Reihenfolge, die du angibst.

### Athom-Installation (bevorzugter Test-Weg)

Test-Builds können nach `homey app publish` und Freigabe als **Test** im Developer-Portal installiert werden:

- Portal: **INSTALL**-Button am Build (z. B. Build #35, Status **Test**)
- Oder Test-URL: `https://homey.app/de-de/app/de.jnkconsulting.e3dc.v2/E3DC---HKW/test/`

Das ersetzt das frühere automatische `homey app install` als Standard nach jeder Änderung.

### Befehls-Referenz

```bash
cd /home/book/projects/e3dc-4-homey
nvm use

# Nur auf Kommando — lokal auf Homey installieren
homey app build
homey app install          # → Homey 192.168.188.62

# Nur auf Kommando — Git (lokal)
# vorher: Version in package.json, .homeycompose/app.json, app.json + .homeychangelog.json
homey app build
git add -u && git commit -m "vX.Y.Z: …"

# Nur auf Kommando — GitHub
git push origin master

# Nur auf Kommando — Athom
homey app validate --level publish
# homey app publish  → Guidelines: y, Version bump: n
# → tools.developer.homey.app → Build als Test aktivieren → INSTALL oder Test-URL
```

- Remote: `https://github.com/Copiis/e3dc-4-homey.git`
- Vor Commit/Publish: Build muss grün sein; keine Credentials committen.
- Vor Athom-Publish: `validate --level publish` muss grün sein.
- **Node.js v24+** (`nvm use` liest `.nvmrc`)
- Kurz in der Antwort nach Deploy: was gemacht wurde (Version, Commit-Hash, Build-Nummer o. Ä.)
- Gegenüber Nutzern/Forum nur **letzte** Testversion + Stable-`/test/`-Link

### Athom-Publish (nur auf Kommando)

1. User sagt explizit **publish / Athom / Test hochladen**
2. `homey app validate --level publish` → `homey app publish` (Version **nicht** erneut bumpen: `n` auf CLI-Frage)
3. **Developer Portal (User, manuell):** Build als **Test** freigeben — Live erst nach Forum-Feedback
4. Installation über **INSTALL** im Portal oder Test-URL (siehe oben)
5. Bei **„Too many requests“**: warten (15–60 Min.), nicht mehrfach hintereinander publishen; kleine UX-Fixes lieber bündeln

### Release-Ablauf (Referenz)

| Schritt | Wann | Wer |
|---------|------|-----|
| Code-Änderung + Backup | Nach Aufgabe | AI automatisch |
| `homey app install` (lokal) | Nur auf dein Kommando | User / AI auf Anweisung |
| `git commit` | Nur auf dein Kommando | User / AI auf Anweisung |
| Git **push** (GitHub/Remote) | Nur auf dein Kommando | User / AI auf Anweisung |
| Athom (`homey app publish`) | Nur auf dein Kommando | User / AI auf Anweisung |
| Portal Test freigeben | Nach Athom-Publish | User manuell |
| Forum-Post | Nach Test-Freigabe | User / AI auf Anweisung |

## Deployment (Homey)

- Ziel-Homey: **Homey** (`192.168.188.62`), eingeloggt als `copiis@vivaldi.net`.
- **`homey app install`** nur noch auf explizites Kommando — nicht mehr automatisch nach Code-Änderungen.
- **Bevorzugter Test-Weg:** Athom Test-Build (Portal **INSTALL** oder `/test/`-URL).
- `homey app run -r` nur für Live-Debugging.

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
