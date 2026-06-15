import Homey, {SimpleClass} from 'homey';
import {Wallbox, WallboxCommandResult} from '../../src/model/wallbox';
import {WallboxLiveState} from '../../src/model/wallbox-live-state';
import {updateCapabilityValue} from '../../src/utils/capability-utils';
import {WallboxConfig} from '../../src/model/wallbox.config';
import {HomePowerStation} from '../../src/model/home-power-station';
import {RscpApi} from '../../src/rscp-api';
import {
  isChargingAlreadyAllowed,
  isChargingAlreadyBlocked,
  isSunModeAlreadyActive,
  isSunModeAlreadyInactive,
} from '../../src/utils/wallbox-command-guard';

const SYNC_CACHE_MAX_AGE_MS = 30_000;

class WallboxDevice extends Homey.Device implements Wallbox {

  private lastSyncedState?: WallboxLiveState;
  private lastSyncedAt = 0;

  async onInit() {
    this.log('WallboxDevice has been initialized');
    await this.migrateCapabilities();
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
    this.lastSyncedState = state;
    this.lastSyncedAt = Date.now();

    updateCapabilityValue('measure_power', state.powerW, this)
    updateCapabilityValue('measure_wallbox_consumption', state.powerW, this)
    updateCapabilityValue('measure_wallbox_solarshare', state.solarPowerW, this)
    updateCapabilityValue('wallbox_charging', state.chargingEnabled, this)
    updateCapabilityValue('wallbox_sun_mode', state.sunModeActive, this)
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
    return Number(config.id)
  }

  private getCachedValue(readValue: (state: WallboxLiveState) => boolean): boolean | undefined {
    if (!this.lastSyncedState || Date.now() - this.lastSyncedAt > SYNC_CACHE_MAX_AGE_MS) {
      return undefined;
    }
    return readValue(this.lastSyncedState);
  }

  private async fetchLiveState(): Promise<WallboxLiveState> {
    const api = await this.getApi()
    const state = await api.readWallboxLiveStateById(this.getWallboxId(), true, this)
    this.lastSyncedState = state
    this.lastSyncedAt = Date.now()
    return state
  }

  private refreshCapabilities(state: WallboxLiveState): void {
    updateCapabilityValue('wallbox_charging', state.chargingEnabled, this)
    updateCapabilityValue('wallbox_sun_mode', state.sunModeActive, this)
  }

  async applyChargingAllowed(enabled: boolean, maxCurrentA?: number): Promise<WallboxCommandResult> {
    const tileAllowed = !!this.getCapabilityValue('wallbox_charging')

    if (enabled === tileAllowed) {
      this.log(`applyChargingAllowed(${enabled}): skip, tile already matches (tile=${tileAllowed})`)
      return { ok: true, skipped: true }
    }

    const live = await this.fetchLiveState()
    const cached = this.getCachedValue(state => state.chargingEnabled)

    if (enabled && isChargingAlreadyAllowed(live, cached, tileAllowed)) {
      this.log(
        `applyChargingAllowed(${enabled}): skip after read (live=${live.chargingEnabled}, `
        + `cached=${cached}, tile=${tileAllowed})`,
      )
      this.refreshCapabilities(live)
      return { ok: true, skipped: true }
    }
    if (!enabled && isChargingAlreadyBlocked(live, cached, tileAllowed)) {
      this.log(
        `applyChargingAllowed(${enabled}): skip after read (live=${live.chargingEnabled}, `
        + `cached=${cached}, tile=${tileAllowed})`,
      )
      this.refreshCapabilities(live)
      return { ok: true, skipped: true }
    }

    const ok = enabled
      ? await this.startCharging(maxCurrentA)
      : await this.stopCharging()
    if (!ok) {
      return { ok: false, skipped: false }
    }

    const after = await this.fetchLiveState()
    this.refreshCapabilities(after)
    return { ok: true, skipped: false }
  }

  async applySunMode(enabled: boolean, maxCurrentA?: number): Promise<WallboxCommandResult> {
    const tileActive = !!this.getCapabilityValue('wallbox_sun_mode')

    if (enabled === tileActive) {
      this.log(`applySunMode(${enabled}): skip, tile already matches (tile=${tileActive})`)
      return { ok: true, skipped: true }
    }

    const live = await this.fetchLiveState()
    const cached = this.getCachedValue(state => state.sunModeActive)

    if (enabled && isSunModeAlreadyActive(live, cached, tileActive)) {
      this.log(
        `applySunMode(${enabled}): skip after read (live=${live.sunModeActive}, `
        + `cached=${cached}, tile=${tileActive})`,
      )
      this.refreshCapabilities(live)
      return { ok: true, skipped: true }
    }
    if (!enabled && isSunModeAlreadyInactive(live, cached, tileActive)) {
      this.log(
        `applySunMode(${enabled}): skip after read (live=${live.sunModeActive}, `
        + `cached=${cached}, tile=${tileActive})`,
      )
      this.refreshCapabilities(live)
      return { ok: true, skipped: true }
    }

    const ok = await this.setSunMode(enabled, maxCurrentA)
    if (!ok) {
      return { ok: false, skipped: false }
    }

    const after = await this.fetchLiveState()
    this.refreshCapabilities(after)
    return { ok: true, skipped: false }
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