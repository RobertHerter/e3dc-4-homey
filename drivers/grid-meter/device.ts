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
      setTimeout(() => this.scheduleTodaySync(), 5000);
    } catch (e) {
      this.error('Grid meter onInit failed: ' + formatError(e));
    }
  }

  async onAdded() {
    this.log('GridMeterDevice has been added');
  }

  /**
   * rawGridDeliveryW: EMS POWER_GRID (same as HPS measure_grid_delivery) —
   * positive = feed-in, negative = grid import.
   * Normalized to positive = import for Energy smart meter + kWh integrator.
   */
  sync(rawGridDeliveryW: number): void {
    const gridPowerW = -rawGridDeliveryW;
    updateCapabilityValue('measure_power', gridPowerW, this);
    const meter = this.energyMeter.integrateGrid(gridPowerW);
    updateCapabilityValue('meter_power.imported', meter.importedKwh, this);
    updateCapabilityValue('meter_power.exported', meter.exportedKwh, this);
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