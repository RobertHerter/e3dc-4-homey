import {Wallbox} from '../../model/wallbox';
import {RunListener} from '../run-listener';

export class WallboxDischargeBatteryUntilActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const wallbox: Wallbox = args.device;
            const percent: number = args.percent;

            if (!wallbox || typeof wallbox.setDischargeBatteryUntil !== 'function') {
                reject('Invalid wallbox device');
                return;
            }

            wallbox.log && wallbox.log(`Batterie Entladegrenze: ${percent}%`);
            try {
                const ok = await wallbox.setDischargeBatteryUntil(percent);
                if (ok) {
                    resolve({ percent });
                } else {
                    reject('E3/DC hat „Batterie Entladegrenze“ abgelehnt');
                }
            } catch (e) {
                wallbox.error && wallbox.error('Batterie Entladegrenze failed: ' + e);
                reject(e);
            }
        });
    }
}