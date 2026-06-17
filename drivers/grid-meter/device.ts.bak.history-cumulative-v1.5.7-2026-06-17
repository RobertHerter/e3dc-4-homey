import Homey, {SimpleClass} from 'homey';
import {clearTimeout} from 'node:timers';
import {GridMeter} from '../../src/model/grid-meter';
import {GridMeterConfig} from '../../src/model/grid-meter.config';
import {HomePowerStation} from '../../src/model/home-power-station';
import {SummaryType} from '../../src/model/summary.config';
import {updateCapabilityValue} from '../../src/utils/capability-utils';
import {EnergyMeterIntegrator} from '../../src/utils/energy-meter-integrator';
import {ensureCapabilities} from '../../src/utils/energy-capability-migration';
import {formatError} from '../../src/utils/error-utils';
import {
  GRID_SIGN_CALIBRATION_VERSION,
  GRID_SIGN_CALIBRATION_VERSION_KEY,
  GRID_SIGN_MULTIPLIER_STORE_KEY,
  calibrateGridSignMultiplier,
  normalizeGridPowerW,
  resolveGridSignMultiplier,
} from '../../src/utils/grid-power-sign';

const TODAY_SYNC_INTERVAL_MS = 1000 * 60 * 5;

class GridMeterDevice extends Homey.Device implements GridMeter {

  private readonly energyMeter = new EnergyMeterIntegrator(this);
  private todayLoopId: NodeJS.Timeout | null = null;

  async onInit() {
    this.log('GridMeterDevice has been initialized');
    try {
      await ensureCapabilities(this, [
        'meter_power.imported',
        'meter_power.exported',
        'measure_grid_in',
        'measure_grid_out',
      ]);
      this.ensureSignCalibrationVersion();
      setTimeout(() => this.scheduleTodaySync(), 5000);
    } catch (e) {
      this.error('Grid meter onInit failed: ' + formatError(e));
    }
  }

  async onAdded() {
    this.log('GridMeterDevice has been added');
  }

  /**
   * rawGridDeliveryW: EMS POWER_GRID (same as HPS measure_grid_delivery).
   * Sign convention varies by firmware — calibrated once using today's E3DC history.
   * Normalized: positive = import (Bezug), negative = export (Einspeisung).
   */
  sync(rawGridDeliveryW: number): void {
    this.tryCalibrateGridSign(rawGridDeliveryW);
    const gridPowerW = normalizeGridPowerW(rawGridDeliveryW, this.getGridSignMultiplier());
    updateCapabilityValue('measure_power', gridPowerW, this);
    const meter = this.energyMeter.integrateGrid(gridPowerW);
    updateCapabilityValue('meter_power.imported', meter.importedKwh, this);
    updateCapabilityValue('meter_power.exported', meter.exportedKwh, this);
  }

  private getGridSignMultiplier(): number {
    return resolveGridSignMultiplier(this.getStoreValue(GRID_SIGN_MULTIPLIER_STORE_KEY));
  }

  private ensureSignCalibrationVersion(): void {
    const storedVersion = this.getStoreValue(GRID_SIGN_CALIBRATION_VERSION_KEY) as number | undefined;
    if (storedVersion === GRID_SIGN_CALIBRATION_VERSION) {
      return;
    }
    this.unsetStoreValue(GRID_SIGN_MULTIPLIER_STORE_KEY).catch(() => undefined);
    this.setStoreValue(GRID_SIGN_CALIBRATION_VERSION_KEY, GRID_SIGN_CALIBRATION_VERSION).catch(() => undefined);
    this.energyMeter.resetGrid();
    this.log('Grid sign calibration reset for v' + GRID_SIGN_CALIBRATION_VERSION);
  }

  private tryCalibrateGridSign(rawGridDeliveryW: number): void {
    if (this.getStoreValue(GRID_SIGN_MULTIPLIER_STORE_KEY) !== undefined) {
      return;
    }
    const gridExportTodayKwh = Number(this.getCapabilityValue('measure_grid_in')) || 0;
    const gridImportTodayKwh = Number(this.getCapabilityValue('measure_grid_out')) || 0;
    const multiplier = calibrateGridSignMultiplier(rawGridDeliveryW, gridExportTodayKwh, gridImportTodayKwh);
    if (multiplier === undefined) {
      return;
    }
    this.setStoreValue(GRID_SIGN_MULTIPLIER_STORE_KEY, multiplier).catch(() => undefined);
    this.energyMeter.resetGrid();
    this.log(`Grid sign calibrated: multiplier=${multiplier} (raw=${rawGridDeliveryW}W, today in/out=${gridExportTodayKwh}/${gridImportTodayKwh} kWh)`);
  }

  private scheduleTodaySync(): void {
    this.syncToday()
      .finally(() => {
        this.todayLoopId = setTimeout(() => this.scheduleTodaySync(), TODAY_SYNC_INTERVAL_MS);
      });
  }

  private syncToday(): Promise<void> {
    return new Promise(resolve => {
      const config = this.getStoreValue('settings') as GridMeterConfig | undefined;
      if (!config?.stationId) {
        this.log('Grid today sync skipped: no station link in store');
        resolve();
        return;
      }
      const station = this.homey.drivers.getDriver('home-power-station').getDevices()
        .find((device: any) => device.getId && device.getId() === config.stationId) as unknown as HomePowerStation | undefined;
      if (!station?.getApi) {
        this.log('Grid today sync skipped: linked HPS not found');
        resolve();
        return;
      }
      station.getApi()
        .readSummaryData(SummaryType.TODAY, true, this)
        .then(result => {
          updateCapabilityValue('measure_grid_in', result.gridIn / 1000.0, this);
          updateCapabilityValue('measure_grid_out', result.gridOut / 1000.0, this);
          const stationDevice = station as unknown as Homey.Device;
          const rawGridW = stationDevice.getCapabilityValue('measure_grid_delivery') as number;
          if (typeof rawGridW === 'number') {
            this.tryCalibrateGridSign(rawGridW);
          }
          resolve();
        })
        .catch(e => {
          this.error('Grid today sync failed: ' + formatError(e));
          resolve();
        });
    });
  }

  async onRenamed(name: string) {
    this.log('GridMeterDevice was renamed to ' + name);
  }

  async onDeleted() {
    this.log('GridMeterDevice has been deleted');
    if (this.todayLoopId) {
      clearTimeout(this.todayLoopId);
    }
  }

  asSimple(): SimpleClass {
    return this;
  }

  translate(key: string | Object, tags?: Object | undefined): string {
    return this.homey.__(key, tags);
  }
}

module.exports = GridMeterDevice;