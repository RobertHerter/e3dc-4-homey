import {RunListener} from '../run-listener';
import {Wallbox} from '../../model/wallbox';
import {resolveWallboxFlowResult} from './wallbox-flow-result';
import {formatError} from '../../utils/error-utils';

export class WallboxBlockChargingActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const wallbox: Wallbox = args.device;

            if (!wallbox || typeof wallbox.applyChargingAllowed !== 'function') {
                reject('Invalid wallbox device');
                return;
            }

            try {
                const result = await wallbox.applyChargingAllowed(false);
                resolveWallboxFlowResult(
                    result,
                    {},
                    'Wallbox rejected block charging',
                    resolve,
                    reject,
                );
            } catch (e) {
                wallbox.error && wallbox.error('Failed to block wallbox charging: ' + formatError(e));
                reject(e);
            }
        });
    }
}