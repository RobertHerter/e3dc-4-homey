import Homey, {SimpleClass} from 'homey';
import {Wallbox} from '../../src/model/wallbox';
import {WallboxLiveState} from '../../src/model/wallbox-live-state';
import {updateCapabilityValue} from '../../src/utils/capability-utils';
import {WallboxConfig} from '../../src/model/wallbox.config';
import {HomePowerStation} from '../../src/model/home-power-station';
import {RscpApi} from '../../src/rscp-api';

const TOGGLE_GUARD_MS = 4000;

class WallboxDevice extends Homey.Device implements Wallbox {

  private toggleGuard = {
    charging: false,
    sunMode: false,
  };

  async onInit() {
    this.log('WallboxDevice has been initialized');
    await this.migrateCapabilities();

    this.registerCapabilityListener('wallbox_charging', async (value: boolean) => {
      this.toggleGuard.charging = true;
      try {
        const ok = value
          ? await this.startCharging()
          : await this.stopCharging();
        if (!ok) {
          throw new Error('Wallbox charging command failed');
        }
      } finally {
        this.homey.setTimeout(() => {
          this.toggleGuard.charging = false;
        }, TOGGLE_GUARD_MS);
      }
    });

    this.registerCapabilityListener('wallbox_sun_mode', async (value: boolean) => {
      this.toggleGuard.sunMode = true;
      try {
        const ok = await this.setSunMode(value);
        if (!ok) {
          throw new Error('Wallbox sun mode command failed');
        }
      } finally {
        this.homey.setTimeout(() => {
          this.toggleGuard.sunMode = false;
        }, TOGGLE_GUARD_MS);
      }
    });
  }

  private async migrateCapabilities(): Promise<void> {
    if (this.hasCapability('evcharger_charging')) {
      await this.removeCapability('evcharger_charging');
    }
    if (this.hasCapability('evcharger_charging_state')) {
      await this.removeCapability('evcharger_charging_state');
    }
  }

  async onAdded() {
    this.log('WallboxDevice has been added');
  }

  sync(state: WallboxLiveState): void {
    updateCapabilityValue('measure_power', state.powerW, this)
    updateCapabilityValue('measure_wallbox_consumption', state.powerW, this)
    updateCapabilityValue('measure_wallbox_solarshare', state.solarPowerW, this)

    if (!this.toggleGuard.charging) {
      updateCapabilityValue('wallbox_charging', state.chargingEnabled, this)
    }
    if (!this.toggleGuard.sunMode) {
      updateCapabilityValue('wallbox_sun_mode', state.sunModeActive, this)
    }
  }

  private getApi(): Promise<RscpApi> {
    const config: WallboxConfig = this.getStoreValue('settings')
    if (!config || !config.stationId) {
      return Promise.reject(new Error('Wallbox not associated with a Home Power Station'))
    }
    const hpsDevices = this.homey.drivers.getDriver('home-power-station').getDevices()
    const station = hpsDevices.find((d: any) => d.getId && d.getId() === config.stationId) as unknown as HomePowerStation | undefined
    if (!station || !station.getApi) {
      return Promise.reject(new Error('Associated Home Power Station not found or not ready'))
    }
    return Promise.resolve(station.getApi())
  }

  private getWallboxId(): number {
    const config: WallboxConfig = this.getStoreValue('settings')
    if (!config || config.id === undefined || config.id === null) {
      throw new Error('Wallbox RSCP id not configured')
    }
    return config.id
  }

  async setCurrentLimit(maxCurrentA: number): Promise<boolean> {
    const api = await this.getApi()
    return api.setWallboxCurrentLimit(this.getWallboxId(), maxCurrentA, true, this)
  }

  async startCharging(maxCurrentA?: number): Promise<boolean> {
    const api = await this.getApi()
    return api.startWallboxCharging(this.getWallboxId(), maxCurrentA, true, this)
  }

  async stopCharging(): Promise<boolean> {
    const api = await this.getApi()
    return api.stopWallboxCharging(this.getWallboxId(), true, this)
  }

  async setSunMode(enabled: boolean, maxCurrentA?: number): Promise<boolean> {
    const api = await this.getApi()
    return api.setWallboxSunMode(this.getWallboxId(), enabled, maxCurrentA, true, this)
  }

  async setBatteryToCar(enabled: boolean): Promise<boolean> {
    const api = await this.getApi()
    return api.setBatteryToCarMode(enabled, true, this)
  }

  async setBatteryBeforeCar(enabled: boolean): Promise<boolean> {
    const api = await this.getApi()
    return api.setBatteryBeforeCarMode(enabled, true, this)
  }

  async setDischargeBatteryUntil(percent: number): Promise<boolean> {
    const api = await this.getApi()
    return api.setWbDischargeBatteryUntil(percent, true, this)
  }

  async setDisableBatteryAtMixMode(enabled: boolean): Promise<boolean> {
    const api = await this.getApi()
    return api.setWallboxDisableBatteryAtMixMode(enabled, true, this)
  }

  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log('WallboxDevice settings were changed');
  }

  async onRenamed(name: string) {
    this.log('WallboxDevice was renamed');
  }

  async onDeleted() {
    this.log('WallboxDevice has been deleted');
  }

  asSimple(): SimpleClass {
    return this;
  }

  translate(key: string | Object, tags?: Object | undefined): string {
    return this.homey.__(key, tags);
  }

}

module.exports = WallboxDevice;