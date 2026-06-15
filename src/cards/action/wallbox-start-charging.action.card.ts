import {RunListener} from '../run-listener';
import {Wallbox} from '../../model/wallbox';
import {DEFAULT_WALLBOX_CURRENT_A} from '../../model/wallbox-control';

export class WallboxStartChargingActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const wallbox: Wallbox = args.device;
            const current: number = (args.current !== undefined && args.current !== null)
                ? args.current
                : DEFAULT_WALLBOX_CURRENT_A;

            if (!wallbox || typeof wallbox.startCharging !== 'function') {
                reject('Invalid wallbox device');
                return;
            }

            try {
                const ok = await wallbox.startCharging(current);
                if (ok) {
                    resolve({ current });
                } else {
                    reject('Wallbox rejected the start command');
                }
            } catch (e) {
                wallbox.error && wallbox.error('Failed to start wallbox charging: ' + e);
                reject(e);
            }
        });
    }
}