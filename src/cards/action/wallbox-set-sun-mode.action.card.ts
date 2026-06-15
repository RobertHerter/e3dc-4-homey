import {RunListener} from '../run-listener';
import {Wallbox} from '../../model/wallbox';
import {DEFAULT_WALLBOX_CURRENT_A} from '../../model/wallbox-control';
import {resolveWallboxFlowResult} from './wallbox-flow-result';

export class WallboxSetSunModeActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const wallbox: Wallbox = args.device;
            const enabled: boolean = !!args.enabled;
            const current: number = (args.current !== undefined && args.current !== null)
                ? args.current
                : DEFAULT_WALLBOX_CURRENT_A;

            if (!wallbox || typeof wallbox.applySunMode !== 'function') {
                reject('Invalid wallbox device');
                return;
            }

            try {
                const result = await wallbox.applySunMode(enabled, current);
                resolveWallboxFlowResult(
                    result,
                    { enabled, current },
                    'Wallbox rejected the sun mode command',
                    resolve,
                    reject,
                );
            } catch (e) {
                wallbox.error && wallbox.error('Failed to set wallbox sun mode: ' + e);
                reject(e);
            }
        });
    }
}