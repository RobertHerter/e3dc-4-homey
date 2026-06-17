import Homey, {SimpleClass} from 'homey';
import {clearTimeout} from 'node:timers';
import {GridMeter} from '../../src/model/grid-meter';
import {GridMeterConfig} from '../../src/model/grid-meter.config';
import {HomePowerStation} from '../../src/model/home-power-station';
import {SummaryData} from '../../src/model/summary-data';
import {SummaryType} from '../../src/model/summary.config';
import {updateCapabilityValue} from '../../src/utils/capability-utils';
import {ensureCapabilities} from '../../src/utils/energy-capability-migration';
import {formatError} from '../../src/utils/error-utils';
import {
  GRID_CUMULATIVE_LOGIC_VERSION,
  GRID_CUMULATIVE_LOGIC_VERSION_KEY,
  GRID_CUMULATIVE_STORE_KEY,
  GridCumulativeArchive,
  cumulativeTotalsFromArchive,
  gridDayTotalsKwh,
  loadGridCumulativeArchive,
  localDateString,
} from '../../src/utils/grid-cumulative-archive';

const TODAY_SYNC_INTERVAL_MS = 1000 * 60 * 5;

class GridMeterDevice extends Homey.Device implements GridMeter {

  private todayLoopId: NodeJS.Timeout | null = null;
  private lastSyncedDate?: string;

  async onInit() {
    this.log('GridMeterDevice has been initialized');
    try {
      await ensureCapabilities(this, [
        'meter_power.imported',
        'meter_power.exported',
        'measure_grid_in',
        'measure_grid_out',
      ]);
      this.ensureCumulativeLogicVersion();
      const archive = this.loadArchive();
      this.lastSyncedDate = archive.lastSyncedDate;
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
   * No sign normalization — matches HKW display convention on this firmware.
   */
  sync(rawGridDeliveryW: number): void {
    updateCapabilityValue('measure_power', rawGridDeliveryW, this);
    this.updateCumulativeMeters();
  }

  private ensureCumulativeLogicVersion(): void {
    const storedVersion = this.getStoreValue(GRID_CUMULATIVE_LOGIC_VERSION_KEY) as number | undefined;
    if (storedVersion === GRID_CUMULATIVE_LOGIC_VERSION) {
      return;
    }
    this.unsetStoreValue(GRID_CUMULATIVE_STORE_KEY).catch(() => undefined);
    this.setStoreValue(GRID_CUMULATIVE_LOGIC_VERSION_KEY, GRID_CUMULATIVE_LOGIC_VERSION).catch(() => undefined);
    this.lastSyncedDate = undefined;
    this.log('Grid cumulative archive reset for v' + GRID_CUMULATIVE_LOGIC_VERSION);
  }

  private loadArchive(): GridCumulativeArchive {
    return loadGridCumulativeArchive(this.getStoreValue(GRID_CUMULATIVE_STORE_KEY) as GridCumulativeArchive | undefined);
  }

  private saveArchive(archive: GridCumulativeArchive): void {
    this.setStoreValue(GRID_CUMULATIVE_STORE_KEY, archive).catch(() => undefined);
  }

  private updateCumulativeMeters(): void {
    const archive = this.loadArchive();
    const todayExportKwh = Number(this.getCapabilityValue('measure_grid_in')) || 0;
    const todayImportKwh = Number(this.getCapabilityValue('measure_grid_out')) || 0;
    const totals = cumulativeTotalsFromArchive(archive, todayImportKwh, todayExportKwh);
    updateCapabilityValue('meter_power.imported', totals.importedKwh, this);
    updateCapabilityValue('meter_power.exported', totals.exportedKwh, this);
  }

  private addSummaryToArchive(archive: GridCumulativeArchive, summary: SummaryData): GridCumulativeArchive {
    const dayTotals = gridDayTotalsKwh(summary.gridIn, summary.gridOut);
    return {
      ...archive,
      importedKwh: archive.importedKwh + dayTotals.importKwh,
      exportedKwh: archive.exportedKwh + dayTotals.exportKwh,
    };
  }

  private scheduleTodaySync(): void {
    this.syncToday()
      .finally(() => {
        this.todayLoopId = setTimeout(() => this.scheduleTodaySync(), TODAY_SYNC_INTERVAL_MS);
      });
  }

  private syncToday(): Promise<void> {
    return new Promise(resolve => {
      const station = this.resolveLinkedStation();
      if (!station) {
        resolve();
        return;
      }
      const timezone = this.homey.clock.getTimezone();
      const todayStr = localDateString(timezone);
      station.getApi()
        .readSummaryData(SummaryType.TODAY, true, this)
        .then(async todayResult => {
          updateCapabilityValue('measure_grid_in', todayResult.gridIn / 1000.0, this);
          updateCapabilityValue('measure_grid_out', todayResult.gridOut / 1000.0, this);

          let archive = this.loadArchive();
          if (this.lastSyncedDate && this.lastSyncedDate < todayStr) {
            try {
              const yesterdayResult = await station.getApi().readSummaryData(SummaryType.YESTERDAY, true, this);
              archive = this.addSummaryToArchive(archive, yesterdayResult);
              this.log(`Grid day rollover: archived ${this.lastSyncedDate} (+${(yesterdayResult.gridOut / 1000).toFixed(2)} kWh in, +${(yesterdayResult.gridIn / 1000).toFixed(2)} kWh out)`);
            } catch (e) {
              this.error('Grid yesterday archive failed: ' + formatError(e));
            }
          }

          archive = {...archive, lastSyncedDate: todayStr};
          this.saveArchive(archive);
          this.lastSyncedDate = todayStr;
          this.updateCumulativeMeters();
          resolve();
        })
        .catch(e => {
          this.error('Grid today sync failed: ' + formatError(e));
          resolve();
        });
    });
  }

  private resolveLinkedStation(): HomePowerStation | undefined {
    const config = this.getStoreValue('settings') as GridMeterConfig | undefined;
    if (!config?.stationId) {
      this.log('Grid today sync skipped: no station link in store');
      return undefined;
    }
    const station = this.homey.drivers.getDriver('home-power-station').getDevices()
      .find((device: any) => device.getId && device.getId() === config.stationId) as unknown as HomePowerStation | undefined;
    if (!station?.getApi) {
      this.log('Grid today sync skipped: linked HPS not found');
      return undefined;
    }
    return station;
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