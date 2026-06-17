/** Normalize WBTag.SOC / EXTERN_DATA_ALG precharge to 0–100 %. */
export function normalizeVehicleSocPercent(raw: number | undefined): number | undefined {
    if (raw === undefined || Number.isNaN(raw)) {
        return undefined;
    }
    if (raw > 100) {
        return raw / 100;
    }
    if (raw >= 0 && raw <= 100) {
        return raw;
    }
    return undefined;
}

/** Prefer dedicated WB.SOC (Tesla/cloud); fall back to EXTERN_DATA_ALG precharge byte. */
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

export function isPlausibleVehicleSocPercent(
    socPercent: number | undefined,
    plugged: boolean,
): boolean {
    if (socPercent === undefined || socPercent < 0 || socPercent > 100) {
        return false;
    }
    // Cloud-bound EVs (e.g. Tesla via E3/DC app) report SOC without plug bit set.
    if (socPercent > 0) {
        return true;
    }
    return plugged;
}