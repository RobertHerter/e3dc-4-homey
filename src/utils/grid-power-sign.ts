/** Normalized grid power: positive = import (Bezug), negative = export (Einspeisung). */
export const GRID_SIGN_MULTIPLIER_STORE_KEY = 'gridSignMultiplier';
export const GRID_SIGN_CALIBRATION_VERSION_KEY = 'gridSignCalibrationVersion';
/** Bump to force re-calibration on existing Netz devices after sign-logic changes. */
export const GRID_SIGN_CALIBRATION_VERSION = 2;

const DEFAULT_MULTIPLIER = -1; // legacy S10-style: EMS POWER_GRID positive = feed-in
const MIN_CALIBRATION_POWER_W = 200;
const MIN_DAY_DELTA_KWH = 0.1;

export function resolveGridSignMultiplier(stored: unknown): number {
  if (stored === 1 || stored === -1) {
    return stored;
  }
  return DEFAULT_MULTIPLIER;
}

/**
 * Infer EMS POWER_GRID sign convention from today's E3DC history + live power.
 * S10/H10: positive raw = feed-in → multiplier -1.
 * Some units (e.g. H20): negative raw = feed-in → multiplier +1.
 */
export function calibrateGridSignMultiplier(
  rawGridDeliveryW: number,
  gridExportTodayKwh: number,
  gridImportTodayKwh: number,
): number | undefined {
  if (Math.abs(rawGridDeliveryW) < MIN_CALIBRATION_POWER_W) {
    return undefined;
  }

  const exportingDay = gridExportTodayKwh > gridImportTodayKwh + MIN_DAY_DELTA_KWH;
  const importingDay = gridImportTodayKwh > gridExportTodayKwh + MIN_DAY_DELTA_KWH;
  if (!exportingDay && !importingDay) {
    return undefined;
  }

  if (exportingDay) {
    return rawGridDeliveryW > 0 ? -1 : 1;
  }
  return rawGridDeliveryW < 0 ? -1 : 1;
}

export function normalizeGridPowerW(rawGridDeliveryW: number, multiplier: number): number {
  return multiplier * rawGridDeliveryW;
}