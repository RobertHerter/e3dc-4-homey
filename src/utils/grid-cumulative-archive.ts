export const GRID_CUMULATIVE_STORE_KEY = 'gridCumulativeArchive';
export const GRID_CUMULATIVE_LOGIC_VERSION_KEY = 'gridCumulativeLogicVersion';
/** Bump when cumulative (gesamt) derivation changes — resets archive on existing devices. */
export const GRID_CUMULATIVE_LOGIC_VERSION = 1;

export interface GridCumulativeArchive {
  importedKwh: number;
  exportedKwh: number;
  /** Local calendar date (YYYY-MM-DD) of the last successful today-sync. */
  lastSyncedDate?: string;
}

export function emptyGridCumulativeArchive(): GridCumulativeArchive {
  return { importedKwh: 0, exportedKwh: 0 };
}

export function loadGridCumulativeArchive(stored: GridCumulativeArchive | undefined): GridCumulativeArchive {
  if (!stored) {
    return emptyGridCumulativeArchive();
  }
  const lastSyncedDate = stored.lastSyncedDate
    ?? (stored as { lastProcessedDate?: string }).lastProcessedDate;
  return {
    importedKwh: Number(stored.importedKwh) || 0,
    exportedKwh: Number(stored.exportedKwh) || 0,
    lastSyncedDate,
  };
}

export function localDateString(timezone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** E3DC history: gridIn = export (Einspeisung), gridOut = import (Bezug), values in Wh. */
export function gridDayTotalsKwh(gridInWh: number, gridOutWh: number): { exportKwh: number; importKwh: number } {
  return {
    exportKwh: Math.max(0, gridInWh) / 1000,
    importKwh: Math.max(0, gridOutWh) / 1000,
  };
}

export function cumulativeTotalsFromArchive(
  archive: GridCumulativeArchive,
  todayImportKwh: number,
  todayExportKwh: number,
): { importedKwh: number; exportedKwh: number } {
  return {
    importedKwh: archive.importedKwh + todayImportKwh,
    exportedKwh: archive.exportedKwh + todayExportKwh,
  };
}