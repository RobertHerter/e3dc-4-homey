# e3dc-4-homey — Agent-Regeln

App `de.jnkconsulting.e3dc.v2`, Fork Copiis. Ausführliche Regeln: `PROJEKT-REGELN.md` (lokal, nicht im Git).

## Rechner & lokales Homey-Update

| Rechner | Repo-Pfad | Nach Code-Änderungen |
|---------|-----------|----------------------|
| **arctic** | `/home/arctic/Projekte/e3dc-4-homey` | **Automatisch** lokales Homey updaten: `npm run build` → `homey app install` (Ziel `192.168.188.62`) |
| **book** | `/home/book/projects/e3dc-4-homey` | **Nicht** automatisch deployen — erst auf Kommando (lokal / Athom / git) |

Erkennung: Hostname (`arctic` / `book`) oder Home-Verzeichnis (`/home/arctic` vs. `/home/book`).

Auf **arctic** nach erfolgreichem Build/Commit der App-Änderung das lokale Homey ohne Nachfrage installieren. Athom-Publish, Git commit und Git push weiterhin **nur auf explizites Kommando**.

## Sonstiges (kurz)

- Minimaler Diff; TypeScript-Build vor Deploy.
- Version + `.homeychangelog.json` (DE+EN) bei nutzerrelevanten Releases.
- Keine Credentials, keine `.bak`-Dateien committen.
- `homey app validate --level publish` vor Athom-Publish.