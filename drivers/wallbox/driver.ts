import Homey from 'homey';
import PairSession from 'homey/lib/PairSession';
import {WallboxConfig} from '../../src/model/wallbox.config';
import {HomePowerStation} from '../../src/model/home-power-station';
import {SetWallboxCurrentActionCard} from '../../src/cards/action/set-wallbox-current.action.card';
import {WallboxStartChargingActionCard} from '../../src/cards/action/wallbox-start-charging.action.card';
import {WallboxStopChargingActionCard} from '../../src/cards/action/wallbox-stop-charging.action.card';
import {WallboxSetSunModeActionCard} from '../../src/cards/action/wallbox-set-sun-mode.action.card';
import {WallboxAllowChargingActionCard} from '../../src/cards/action/wallbox-allow-charging.action.card';
import {WallboxBlockChargingActionCard} from '../../src/cards/action/wallbox-block-charging.action.card';
import {WallboxSunModeOnActionCard} from '../../src/cards/action/wallbox-sun-mode-on.action.card';
import {WallboxSunModeOffActionCard} from '../../src/cards/action/wallbox-sun-mode-off.action.card';
import {WallboxBatteryToCarActionCard} from '../../src/cards/action/wallbox-battery-to-car.action.card';
import {WallboxBatteryBeforeCarActionCard} from '../../src/cards/action/wallbox-battery-before-car.action.card';
import {WallboxDischargeBatteryUntilActionCard} from '../../src/cards/action/wallbox-discharge-battery-until.action.card';
import {WallboxDisableBatteryMixModeActionCard} from '../../src/cards/action/wallbox-disable-battery-mix-mode.action.card';
import {WallboxSunModeIsActiveConditionCard} from '../../src/cards/condition/wallbox-sun-mode-is-active.condition.card';
import {WallboxSunModeIsOffConditionCard} from '../../src/cards/condition/wallbox-sun-mode-is-off.condition.card';
import {WallboxChargingIsAllowedConditionCard} from '../../src/cards/condition/wallbox-charging-is-allowed.condition.card';
import {WallboxChargingIsBlockedConditionCard} from '../../src/cards/condition/wallbox-charging-is-blocked.condition.card';
import {RunListener} from '../../src/cards/run-listener';

class WallboxDriver extends Homey.Driver {

  async onInit() {
    this.log('WallboxDriver has been initialized');
    this.setupActionCards();
    this.setupConditionCards();
  }

  private setupConditionCards() {
    const cards: Array<{ id: string, listener: RunListener }> = [
      { id: 'wallbox_sun_mode_is_active', listener: new WallboxSunModeIsActiveConditionCard() },
      { id: 'wallbox_sun_mode_is_off', listener: new WallboxSunModeIsOffConditionCard() },
      { id: 'wallbox_charging_is_allowed', listener: new WallboxChargingIsAllowedConditionCard() },
      { id: 'wallbox_charging_is_blocked', listener: new WallboxChargingIsBlockedConditionCard() },
    ];
    cards.forEach(({ id, listener }) => {
      try {
        this.homey.flow.getConditionCard(id).registerRunListener(listener.run);
      } catch (e) {
        this.log(`Condition card ${id} not registered: ` + e);
      }
    });
  }

  private setupActionCards() {
    const cards: Array<{ id: string, listener: RunListener }> = [
      { id: 'wallbox_allow_charging', listener: new WallboxAllowChargingActionCard() },
      { id: 'wallbox_block_charging', listener: new WallboxBlockChargingActionCard() },
      { id: 'wallbox_sun_mode_on', listener: new WallboxSunModeOnActionCard() },
      { id: 'wallbox_sun_mode_off', listener: new WallboxSunModeOffActionCard() },
      { id: 'set_wallbox_current', listener: new SetWallboxCurrentActionCard() },
      { id: 'wallbox_start_charging', listener: new WallboxStartChargingActionCard() },
      { id: 'wallbox_stop_charging', listener: new WallboxStopChargingActionCard() },
      { id: 'wallbox_set_sun_mode', listener: new WallboxSetSunModeActionCard() },
      { id: 'wallbox_battery_to_car', listener: new WallboxBatteryToCarActionCard() },
      { id: 'wallbox_battery_before_car', listener: new WallboxBatteryBeforeCarActionCard() },
      { id: 'wallbox_discharge_battery_until', listener: new WallboxDischargeBatteryUntilActionCard() },
      { id: 'wallbox_disable_battery_mix_mode', listener: new WallboxDisableBatteryMixModeActionCard() },
    ];
    cards.forEach(({ id, listener }) => {
      try {
        this.homey.flow.getActionCard(id).registerRunListener(listener.run);
      } catch (e) {
        this.log(`Flow card ${id} not registered: ` + e);
      }
    });
  }

  onPair(session: PairSession): Promise<void> {
    session.setHandler("list_devices", async () => {
      return await this.onPairListDevices();
    });
    return Promise.resolve();
  }

  async onPairListDevices(): Promise<any[]> {
    const homePowerStations = this.homey.drivers.getDriver('home-power-station').getDevices()
    const devices: any[] = []
    for (let i = 0; i < homePowerStations.length; i++) {
      const rawStation = homePowerStations[i]
      let station: HomePowerStation = rawStation as unknown as HomePowerStation;
      const stationData = rawStation.getData()
      const stationId = stationData.id;
      const api = station.getApi()
      const wallboxes = await api.readConnectedWallboxes(true, this)
      this.log('Found ' + wallboxes.length + ' wallboxes')
      wallboxes.forEach(value => {
        const wbId = value.id
        const settings: WallboxConfig = {
          id: wbId,
          stationId: stationId,
        }
        devices.push({
          name: rawStation.getName() + ' - ' + value.name,
          data: {
            id: 'wb-' + stationId + '-' + wbId
          },
          store: {
            settings: settings
          }
        })
      })
    }
    return devices
  }
}

module.exports = WallboxDriver;
