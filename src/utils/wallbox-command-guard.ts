import {WallboxLiveState} from '../model/wallbox-live-state';

export function isChargingAlreadyAllowed(
    live: WallboxLiveState,
    cached: boolean | undefined,
    tile: boolean,
): boolean {
    return live.chargingEnabled || cached === true || tile;
}

export function isChargingAlreadyBlocked(
    live: WallboxLiveState,
    cached: boolean | undefined,
    tile: boolean,
): boolean {
    return !live.chargingEnabled && cached !== true && !tile;
}

export function isSunModeAlreadyActive(
    live: WallboxLiveState,
    cached: boolean | undefined,
    tile: boolean,
): boolean {
    return live.sunModeActive || cached === true || tile;
}

export function isSunModeAlreadyInactive(
    live: WallboxLiveState,
    cached: boolean | undefined,
    tile: boolean,
): boolean {
    return !live.sunModeActive && cached !== true && !tile;
}