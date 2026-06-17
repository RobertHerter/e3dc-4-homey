import {Data, DataParser, DefaultDataParser, WBTag} from 'easy-rscp';
import {findDataByTag, readTagNumber} from './rscp-data-utils';

/** Normalize WBTag.SOC (UInt16) / EXTERN_DATA_ALG precharge to 0–100 %. */
export function normalizeVehicleSocPercent(raw: number | undefined): number | undefined {
    if (raw === undefined || Number.isNaN(raw)) {
        return undefined;
    }
    const value = Math.round(raw);
    if (value < 0) {
        return undefined;
    }
    if (value <= 100) {
        return value;
    }
    if (value <= 10000) {
        return Math.round(value / 100);
    }
    return undefined;
}

/** Prefer dedicated WB.SOC; fall back to EXTERN_DATA_ALG precharge byte. */
export function pickVehicleSocPercent(
    rscpSoc: number | undefined,
    algSoc: number | undefined,
): number | undefined {
    const normalizedRscp = normalizeVehicleSocPercent(rscpSoc);
    const normalizedAlg = normalizeVehicleSocPercent(algSoc);

    if (normalizedRscp !== undefined && normalizedRscp > 0) {
        return normalizedRscp;
    }
    if (normalizedAlg !== undefined && normalizedAlg > 0) {
        return normalizedAlg;
    }
    return normalizedRscp ?? normalizedAlg;
}

export function readVehicleSocFromBlocks(
    blocks: Data[],
    parser: DataParser = new DefaultDataParser(),
): number | undefined {
    return readTagNumber(findDataByTag(blocks, WBTag.SOC, parser));
}

export function isPlausibleVehicleSocPercent(
    socPercent: number | undefined,
    plugged: boolean,
    chargingActive = false,
): boolean {
    if (socPercent === undefined || socPercent < 0 || socPercent > 100) {
        return false;
    }
    if (socPercent > 0) {
        return true;
    }
    return plugged || chargingActive;
}