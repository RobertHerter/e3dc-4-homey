import Homey, {SimpleClass} from 'homey';
import {GridMeter} from '../../src/model/grid-meter';
import {updateCapabilityValue} from '../../src/utils/capability-utils';
import {EnergyMeterIntegrator} from '../../src/utils/energy-meter-integrator';
import {ensureCapabilities} from '../../src/utils/energy-capability-migration';
import {formatError} from '../../src/utils/error-utils';

class GridMeterDevice extends Homey.Device implements GridMeter {

  private readonly energyMeter = new EnergyMeterIntegrator(this);

  async onInit() {
    this.log('GridMeterDevice has been initialized');
    try {
      await ensureCapabilities(this, ['meter_power.imported', 'meter_power.exported']);
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

  async onRenamed(name: string) {
    this.log('GridMeterDevice was renamed to ' + name);
  }

  async onDeleted() {
    this.log('GridMeterDevice has been deleted');
  }

  asSimple(): SimpleClass {
    return this;
  }

  translate(key: string | Object, tags?: Object | undefined): string {
    return this.homey.__(key, tags);
  }
}

module.exports = GridMeterDevice;