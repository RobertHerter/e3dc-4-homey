import {formatError} from './error-utils';
import Homey from 'homey';

const STORE_KEY = 'energyMeterIntegrator';

export interface EnergyMeterIntegratorState {
  chargedKwh: number;
  dischargedKwh: number;
  generatedKwh: number;
  importedKwh: number;
  exportedKwh: number;
  lastSampleMs?: number;
}

export class EnergyMeterIntegrator {

  constructor(private readonly device: Homey.Device) {}

  integrateGeneration(powerW: number, nowMs: number = Date.now()): number {
    const state = this.load();
    this.integrateSignedPower(state, Math.max(0, powerW), nowMs, 'generatedKwh');
    return state.generatedKwh;
  }

  integrateGrid(gridPowerW: number, nowMs: number = Date.now()): { importedKwh: number; exportedKwh: number } {
    const state = this.load();
    if (gridPowerW > 0) {
      this.integrateSignedPower(state, gridPowerW, nowMs, 'importedKwh');
    } else if (gridPowerW < 0) {
      this.integrateSignedPower(state, Math.abs(gridPowerW), nowMs, 'exportedKwh');
    } else {
      state.lastSampleMs = nowMs;
      this.save(state);
    }
    return {
      importedKwh: state.importedKwh,
      exportedKwh: state.exportedKwh,
    };
  }

  integrateBattery(powerW: number, nowMs: number = Date.now()): { chargedKwh: number; dischargedKwh: number } {
    const state = this.load();
    if (powerW > 0) {
      this.integrateSignedPower(state, powerW, nowMs, 'chargedKwh');
    } else if (powerW < 0) {
      this.integrateSignedPower(state, Math.abs(powerW), nowMs, 'dischargedKwh');
    } else {
      state.lastSampleMs = nowMs;
      this.save(state);
    }
    return {
      chargedKwh: state.chargedKwh,
      dischargedKwh: state.dischargedKwh,
    };
  }

  private integrateSignedPower(
    state: EnergyMeterIntegratorState,
    powerW: number,
    nowMs: number,
    field: 'chargedKwh' | 'dischargedKwh' | 'generatedKwh' | 'importedKwh' | 'exportedKwh',
  ): void {
    if (state.lastSampleMs !== undefined && nowMs > state.lastSampleMs && powerW > 0) {
      const deltaHours = (nowMs - state.lastSampleMs) / 3_600_000;
      state[field] += (powerW * deltaHours) / 1000;
    }
    state.lastSampleMs = nowMs;
    this.save(state);
  }

  private load(): EnergyMeterIntegratorState {
    const stored = this.device.getStoreValue(STORE_KEY) as EnergyMeterIntegratorState | undefined;
    if (!stored) {
      return {
        chargedKwh: 0,
        dischargedKwh: 0,
        generatedKwh: 0,
        importedKwh: 0,
        exportedKwh: 0,
      };
    }
    return {
      chargedKwh: Number(stored.chargedKwh) || 0,
      dischargedKwh: Number(stored.dischargedKwh) || 0,
      generatedKwh: Number(stored.generatedKwh) || 0,
      importedKwh: Number(stored.importedKwh) || 0,
      exportedKwh: Number(stored.exportedKwh) || 0,
      lastSampleMs: stored.lastSampleMs,
    };
  }

  private save(state: EnergyMeterIntegratorState): void {
    this.device.setStoreValue(STORE_KEY, state).catch((error: unknown) => {
      this.device.error(`Failed to persist energy meter state: ${formatError(error)}`);
    });
  }
}

const WALLBOX_METER_STORE_KEY = 'wallboxMeterKwh';

export function wallboxTotalEnergyKwh(totalEnergyWh: number | undefined, device: Homey.Device): number | undefined {
  if (totalEnergyWh === undefined || totalEnergyWh === null || Number.isNaN(totalEnergyWh)) {
    return undefined;
  }
  const kwh = Math.max(0, totalEnergyWh) / 1000;
  const lastKwh = device.getStoreValue(WALLBOX_METER_STORE_KEY) as number | undefined;
  if (lastKwh !== undefined && kwh < lastKwh) {
    device.log(`Wallbox meter reset detected (${lastKwh} -> ${kwh} kWh); keeping last value`);
    return lastKwh;
  }
  device.setStoreValue(WALLBOX_METER_STORE_KEY, kwh).catch(() => undefined);
  return kwh;
}