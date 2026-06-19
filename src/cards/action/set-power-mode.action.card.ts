import {HomePowerStation} from '../../model/home-power-station';
import {RunListener} from '../run-listener';
import {formatError} from '../../utils/error-utils';

export const POWER_MODE_AUTO = 0
export const POWER_MODE_IDLE = 1
export const POWER_MODE_DISCHARGE = 2
export const POWER_MODE_CHARGE = 3
export const POWER_MODE_GRID_CHARGE = 4

export class SetPowerModeAutoActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const hps: HomePowerStation = args.device;
            hps.log('SetPowerModeAutoActionCard: triggered')
            hps.setPowerModeState(null)
            hps.getApi()
                .setPowerMode(POWER_MODE_AUTO, 0, true, hps)
                .then(() => resolve(undefined))
                .catch(reason => {
                    hps.error('SetPowerModeAutoActionCard failed: ' + formatError(reason))
                    reject(reason)
                })
        })
    }
}

export class SetPowerModeIdleActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const hps: HomePowerStation = args.device;
            const durationMinutes: number = args.duration;
            hps.log('SetPowerModeIdleActionCard: triggered -> ' + durationMinutes + ' min')
            hps.setPowerModeState({
                mode: POWER_MODE_IDLE,
                powerW: 0,
                expiresAt: Date.now() + durationMinutes * 60 * 1000
            })
            hps.getApi()
                .setPowerMode(POWER_MODE_IDLE, 0, true, hps)
                .then(() => resolve(undefined))
                .catch(reason => {
                    hps.error('SetPowerModeIdleActionCard failed: ' + formatError(reason))
                    reject(reason)
                })
        })
    }
}

export class SetPowerModeChargeActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const hps: HomePowerStation = args.device;
            const powerW: number = args.power;
            const durationMinutes: number = args.duration;
            hps.log('SetPowerModeChargeActionCard: triggered -> ' + powerW + 'W for ' + durationMinutes + ' min')
            hps.setPowerModeState({
                mode: POWER_MODE_CHARGE,
                powerW,
                expiresAt: Date.now() + durationMinutes * 60 * 1000
            })
            hps.getApi()
                .setPowerMode(POWER_MODE_CHARGE, powerW, true, hps)
                .then(() => resolve(undefined))
                .catch(reason => {
                    hps.error('SetPowerModeChargeActionCard failed: ' + formatError(reason))
                    reject(reason)
                })
        })
    }
}

export class SetPowerModeDischargeActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const hps: HomePowerStation = args.device;
            const powerW: number = args.power;
            const durationMinutes: number = args.duration;
            hps.log('SetPowerModeDischargeActionCard: triggered -> ' + powerW + 'W for ' + durationMinutes + ' min')
            hps.setPowerModeState({
                mode: POWER_MODE_DISCHARGE,
                powerW,
                expiresAt: Date.now() + durationMinutes * 60 * 1000
            })
            hps.getApi()
                .setPowerMode(POWER_MODE_DISCHARGE, powerW, true, hps)
                .then(() => resolve(undefined))
                .catch(reason => {
                    hps.error('SetPowerModeDischargeActionCard failed: ' + formatError(reason))
                    reject(reason)
                })
        })
    }
}

export class SetPowerModeGridChargeActionCard implements RunListener {
    run(args: any, state: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const hps: HomePowerStation = args.device;
            const powerW: number = args.power;
            const durationMinutes: number = args.duration;
            hps.log('SetPowerModeGridChargeActionCard: triggered -> ' + powerW + 'W for ' + durationMinutes + ' min')
            hps.setPowerModeState({
                mode: POWER_MODE_GRID_CHARGE,
                powerW,
                expiresAt: Date.now() + durationMinutes * 60 * 1000
            })
            hps.getApi()
                .setPowerMode(POWER_MODE_GRID_CHARGE, powerW, true, hps)
                .then(() => resolve(undefined))
                .catch(reason => {
                    hps.error('SetPowerModeGridChargeActionCard failed: ' + formatError(reason))
                    reject(reason)
                })
        })
    }
}
