import {RunListener} from '../run-listener';
import {Wallbox} from '../../model/wallbox';

export class WallboxStopChargingActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const wallbox: Wallbox = args.device;

            if (!wallbox || typeof wallbox.stopCharging !== 'function') {
                reject('Invalid wallbox device');
                return;
            }

            try {
                const ok = await wallbox.stopCharging();
                if (ok) {
                    resolve(true);
                } else {
                    reject('Wallbox rejected the stop command');
                }
            } catch (e) {
                wallbox.error && wallbox.error('Failed to stop wallbox charging: ' + e);
                reject(e);
            }
        });
    }
}