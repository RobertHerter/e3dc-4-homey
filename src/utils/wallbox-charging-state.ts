import {WallboxLiveState} from '../model/wallbox-live-state';

export type EvchargerChargingState =
    | 'plugged_out'
    | 'plugged_in'
    | 'plugged_in_paused'
    | 'plugged_in_charging'
    | 'plugged_in_discharging';

export function deriveEvchargerChargingState(state: WallboxLiveState): EvchargerChargingState {
    if (!state.plugged) {
        return 'plugged_out';
    }
    if (state.chargingCanceled) {
        return 'plugged_in_paused';
    }
    if (state.powerW < -50) {
        return 'plugged_in_discharging';
    }
    if (state.chargingActive || state.powerW > 0) {
        return 'plugged_in_charging';
    }
    return 'plugged_in';
}