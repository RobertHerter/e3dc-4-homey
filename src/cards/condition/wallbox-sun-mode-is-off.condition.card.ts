import {RunListener} from '../run-listener';
import {Wallbox} from '../../model/wallbox';

export class WallboxSunModeIsOffConditionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>((resolve) => {
            const wallbox = args.device as Wallbox & { getCapabilityValue(id: string): unknown };
            if (!wallbox || typeof wallbox.getCapabilityValue !== 'function') {
                resolve(true);
                return;
            }
            resolve(!wallbox.getCapabilityValue('wallbox_sun_mode'));
        });
    }
}