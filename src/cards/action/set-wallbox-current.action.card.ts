import {RunListener} from '../run-listener';
import {Wallbox} from '../../model/wallbox';
import {formatError} from '../../utils/error-utils';

export class SetWallboxCurrentActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const wallbox: Wallbox = args.device;
            const current: number = args.current;

            if (!wallbox || typeof wallbox.setCurrentLimit !== 'function') {
                reject('Invalid wallbox device');
                return;
            }

            wallbox.log && wallbox.log(`Setting wallbox current to ${current}A`);
            try {
                const ok = await wallbox.setCurrentLimit(current);
                if (ok) {
                    wallbox.log && wallbox.log('Wallbox current set successfully');
                    resolve({ current });
                } else {
                    reject('Wallbox rejected the command (check RSCP connection / permissions)');
                }
            } catch (e) {
                wallbox.error && wallbox.error('Failed to set wallbox current: ' + formatError(e));
                reject(e);
            }
        });
    }
}