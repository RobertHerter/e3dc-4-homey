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

/** Prefer dedicated WB.SOC; fall back to charge-plan text / EXTERN_DATA_ALG precharge. */
export function pickVehicleSocPercent(...candidates: Array<number | undefined>): number | undefined {
    const normalized = candidates
        .map(normalizeVehicleSocPercent)
        .filter((value): value is number => value !== undefined);

    const positive = normalized.find(value => value > 0);
    if (positive !== undefined) {
        return positive;
    }
    return normalized[0];
}

export function readVehicleSocFromBlocks(
    blocks: Data[],
    parser: DataParser = new DefaultDataParser(),
): number | undefined {
    return readTagNumber(findDataByTag(blocks, WBTag.SOC, parser));
}

/** Only positive values are trustworthy — RSCP often returns 0 for cloud-paired EVs (e.g. Tesla). */
export function isPlausibleVehicleSocPercent(socPercent: number | undefined): boolean {
    return socPercent !== undefined && socPercent > 0 && socPercent <= 100;
}