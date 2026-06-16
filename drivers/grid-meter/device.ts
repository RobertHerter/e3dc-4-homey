import Homey, {SimpleClass} from 'homey';
import {GridMeter} from '../../src/model/grid-meter';
import {updateCapabilityValue} from '../../src/utils/capability-utils';
import {EnergyMeterIntegrator} from '../../src/utils/energy-meter-integrator';
import {ensureCapabilities} from '../../src/utils/energy-capability-migration';

class GridMeterDevice extends Homey.Device implements GridMeter {

  private readonly energyMeter = new EnergyMeterIntegrator(this);

  async onInit() {
    this.log('GridMeterDevice has been initialized');
    await ensureCapabilities(this, ['meter_power.imported', 'meter_power.exported']);
  }

  async onAdded() {
    this.log('GridMeterDevice has been added');
  }

  /**
   * gridPowerW: raw EMS POWER_GRID — positive = grid import, negative = grid export.
   */
  sync(gridPowerW: number): void {
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