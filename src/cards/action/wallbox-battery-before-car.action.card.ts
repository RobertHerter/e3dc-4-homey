import {Wallbox} from '../../model/wallbox';
import {isBatteryFirst} from '../../utils/wallbox-e3dc-settings';
import {RunListener} from '../run-listener';

export class WallboxBatteryBeforeCarActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const wallbox: Wallbox = args.device;
            const batteryFirst = isBatteryFirst(args.priority, args.enabled);

            if (!wallbox || typeof wallbox.setBatteryBeforeCar !== 'function') {
                reject('Invalid wallbox device');
                return;
            }

            wallbox.log && wallbox.log(`Ladepriorität: ${batteryFirst ? 'Batterie zuerst' : 'Wallbox zuerst'}`);
            try {
                const ok = await wallbox.setBatteryBeforeCar(batteryFirst);
                if (ok) {
                    resolve({ priority: batteryFirst ? 'batterie_zuerst' : 'wallbox_zuerst' });
                } else {
                    reject('E3/DC hat „Ladepriorität“ abgelehnt');
                }
            } catch (e) {
                wallbox.error && wallbox.error('Ladepriorität failed: ' + e);
                reject(e);
            }
        });
    }
}