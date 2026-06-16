import Homey from 'homey';
import PairSession from 'homey/lib/PairSession';
import {GridMeterConfig} from '../../src/model/grid-meter.config';

class GridMeterDriver extends Homey.Driver {

  async onInit() {
    this.log('GridMeterDriver has been initialized');
  }

  onPair(session: PairSession): Promise<void> {
    session.setHandler('list_devices', async () => this.onPairListDevices());
    return Promise.resolve();
  }

  async onPairListDevices() {
    const homePowerStations = this.homey.drivers.getDriver('home-power-station').getDevices();
    const devices = [];

    for (let i = 0; i < homePowerStations.length; i++) {
      const station = homePowerStations[i];
      const stationData = await station.getData();
      const stationId = stationData.id;
      const settings: GridMeterConfig = {
        stationId,
      };
      devices.push({
        name: station.getName() + ' - Netz',
        data: {
          id: 'grid-' + stationId + '-' + Date.now(),
        },
        store: {
          settings,
        },
      });
    }

    return devices;
  }
}

module.exports = GridMeterDriver;