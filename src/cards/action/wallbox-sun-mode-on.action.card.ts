import {RunListener} from '../run-listener';
import {Wallbox} from '../../model/wallbox';
import {DEFAULT_WALLBOX_CURRENT_A} from '../../model/wallbox-control';
import {resolveWallboxFlowResult} from './wallbox-flow-result';

export class WallboxSunModeOnActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const wallbox: Wallbox = args.device;
            const current: number = (args.current !== undefined && args.current !== null)
                ? args.current
                : DEFAULT_WALLBOX_CURRENT_A;

            if (!wallbox || typeof wallbox.applySunMode !== 'function') {
                reject('Invalid wallbox device');
                return;
            }

            try {
                const result = await wallbox.applySunMode(true, current);
                resolveWallboxFlowResult(
                    result,
                    { current },
                    'Wallbox rejected sun mode on',
                    resolve,
                    reject,
                );
            } catch (e) {
                wallbox.error && wallbox.error('Failed to enable wallbox sun mode: ' + e);
                reject(e);
            }
        });
    }
}