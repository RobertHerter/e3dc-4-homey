export type DiagnosticLevel = 'info' | 'warn' | 'error';

export interface DiagnosticEntry {
    at: Date;
    level: DiagnosticLevel;
    message: string;
}

export interface DiagnosticSnapshot {
    appVersion: string;
    deviceName: string;
    deviceId: string;
    homeyVersion?: string;
    available: boolean;
    syncErrorCount: number;
    lastSyncAt?: Date;
    lastSyncResult?: 'ok' | 'error';
    pvW?: number;
    houseW?: number;
    gridW?: number;
    batteryPct?: number;
    wallboxDeviceCount: number;
    batteryDeviceCount: number;
    firmware?: string;
}

const MAX_ENTRIES = 20;
const MAX_REPORT_CHARS = 6000;

export class DeviceDiagnostic {
    private readonly entries: DiagnosticEntry[] = [];

    push(level: DiagnosticLevel, message: string, at: Date = new Date()): void {
        this.entries.push({ at, level, message });
        while (this.entries.length > MAX_ENTRIES) {
            this.entries.shift();
        }
    }

    info(message: string): void {
        this.push('info', message);
    }

    warn(message: string): void {
        this.push('warn', message);
    }

    error(message: string): void {
        this.push('error', message);
    }

    formatReport(snapshot: DiagnosticSnapshot): string {
        const lines: string[] = [];
        lines.push('E3DC 4 Homey — Diagnose / Diagnostic');
        lines.push(`App: ${snapshot.appVersion}`);
        lines.push(`HKW: ${snapshot.deviceName} (${snapshot.deviceId})`);
        if (snapshot.homeyVersion) {
            lines.push(`Homey: ${snapshot.homeyVersion}`);
        }
        lines.push(`Erstellt / Created: ${snapshot.lastSyncAt?.toISOString() ?? new Date().toISOString()}`);
        lines.push('');
        lines.push(
            `Status: ${snapshot.available ? 'verfügbar / available' : 'nicht verfügbar / unavailable'}`
            + ` | Sync-Fehler / errors: ${snapshot.syncErrorCount}`,
        );
        if (snapshot.lastSyncResult) {
            lines.push(`Letzter Sync / last sync: ${snapshot.lastSyncResult}`);
        }
        lines.push(
            `Geräte / devices: Wallbox ${snapshot.wallboxDeviceCount}`
            + ` | Batteriemonitor / battery monitor ${snapshot.batteryDeviceCount}`,
        );
        if (snapshot.firmware) {
            lines.push(`Firmware: ${snapshot.firmware}`);
        }
        lines.push('');
        lines.push('Werte / values (letzter erfolgreicher Sync / last successful sync):');
        lines.push(`  PV: ${formatW(snapshot.pvW)}`);
        lines.push(`  Haus / house: ${formatW(snapshot.houseW)}`);
        lines.push(`  Netz / grid: ${formatW(snapshot.gridW)}`);
        lines.push(`  Batterie / battery: ${formatPct(snapshot.batteryPct)}`);
        lines.push('');
        lines.push('Log (neueste zuerst / newest first):');
        const logLines = [...this.entries].reverse().map(entry => formatEntry(entry));
        if (logLines.length === 0) {
            lines.push('  (keine Einträge / no entries)');
        } else {
            lines.push(...logLines.map(line => `  ${line}`));
        }
        lines.push('');
        lines.push('Forum: Version + diesen Text kopieren (Einstellungen → Diagnose oder Flow-Token).');
        lines.push('Keine Passwörter / no passwords in this report.');

        let report = lines.join('\n');
        if (report.length > MAX_REPORT_CHARS) {
            report = `${report.slice(0, MAX_REPORT_CHARS - 20)}\n… (gekürzt / truncated)`;
        }
        return report;
    }
}

function formatW(value: number | undefined): string {
    if (value === undefined || Number.isNaN(value)) {
        return '—';
    }
    return `${Math.round(value)} W`;
}

function formatPct(value: number | undefined): string {
    if (value === undefined || Number.isNaN(value)) {
        return '—';
    }
    return `${Math.round(value)} %`;
}

function formatEntry(entry: DiagnosticEntry): string {
    const time = entry.at.toISOString().slice(11, 19);
    const prefix = entry.level === 'error' ? 'ERR' : entry.level === 'warn' ? 'WRN' : 'INF';
    return `[${time}] ${prefix} ${entry.message}`;
}