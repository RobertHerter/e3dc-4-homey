import {RunListener} from '../run-listener';
import {Wallbox} from '../../model/wallbox';
import {resolveWallboxFlowResult} from './wallbox-flow-result';

export class WallboxSunModeOffActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const wallbox: Wallbox = args.device;

            if (!wallbox || typeof wallbox.applySunMode !== 'function') {
                reject('Invalid wallbox device');
                return;
            }

            try {
                const result = await wallbox.applySunMode(false);
                resolveWallboxFlowResult(
                    result,
                    {},
                    'Wallbox rejected sun mode off',
                    resolve,
                    reject,
                );
            } catch (e) {
                wallbox.error && wallbox.error('Failed to disable wallbox sun mode: ' + e);
                reject(e);
            }
        });
    }
}