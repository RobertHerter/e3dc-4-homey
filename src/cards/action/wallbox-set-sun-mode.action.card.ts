import {RunListener} from '../run-listener';
import {Wallbox} from '../../model/wallbox';
import {DEFAULT_WALLBOX_CURRENT_A} from '../../model/wallbox-control';

export class WallboxSetSunModeActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const wallbox: Wallbox = args.device;
            const enabled: boolean = !!args.enabled;
            const current: number = (args.current !== undefined && args.current !== null)
                ? args.current
                : DEFAULT_WALLBOX_CURRENT_A;

            if (!wallbox || typeof wallbox.setSunMode !== 'function') {
                reject('Invalid wallbox device');
                return;
            }

            try {
                const ok = await wallbox.setSunMode(enabled, current);
                if (ok) {
                    resolve({ enabled, current });
                } else {
                    reject('Wallbox rejected the sun mode command');
                }
            } catch (e) {
                wallbox.error && wallbox.error('Failed to set wallbox sun mode: ' + e);
                reject(e);
            }
        });
    }
}