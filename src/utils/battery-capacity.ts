import {BatteryData} from '../model/battery-data';

const MIN_PLAUSIBLE_USABLE_WH = 500

function isPlausibleUsableWh(value: number, specifiedWh: number): boolean {
    return value >= MIN_PLAUSIBLE_USABLE_WH && (specifiedWh <= 0 || value <= specifiedWh * 1.05)
}

/** ASOC variants: Wh (post /100), raw centi-Wh, or health percent (0–100). */
function asocCandidatesWh(battery: BatteryData): number[] {
    const specified = battery.capacity
    const candidates: number[] = []

    if (battery.asocRaw !== undefined && battery.asocRaw > 0) {
        const fromCentiWh = battery.asocRaw / 100
        if (isPlausibleUsableWh(fromCentiWh, specified)) {
            candidates.push(fromCentiWh)
        }
        if (battery.asocRaw > 0 && battery.asocRaw <= 100 && specified > 0) {
            const fromPercent = specified * (battery.asocRaw / 100)
            if (isPlausibleUsableWh(fromPercent, specified)) {
                candidates.push(fromPercent)
            }
        }
    }

    if (isPlausibleUsableWh(battery.asoc, specified)) {
        candidates.push(battery.asoc)
    } else if (battery.asoc > 0 && battery.asoc <= 100 && specified > 0) {
        const fromPercent = specified * (battery.asoc / 100)
        if (isPlausibleUsableWh(fromPercent, specified)) {
            candidates.push(fromPercent)
        }
    }

    return candidates
}

/** Usable full-charge capacity in Wh; picks the best plausible RSCP source. */
export function resolveUsableCapacityWh(battery: BatteryData): number {
    const specified = battery.capacity
    const candidates: number[] = []

    for (const value of [
        battery.usableCapacityWh,
        battery.reserveMaxWh,
        battery.dcbFullChargeWh,
        ...asocCandidatesWh(battery),
    ]) {
        if (value !== undefined && isPlausibleUsableWh(value, specified)) {
            candidates.push(value)
        }
    }

    if (candidates.length > 0) {
        return Math.round(candidates[0]!)
    }

    if (specified > 0) {
        return Math.round(specified)
    }

    return Math.round(battery.asoc > 0 ? battery.asoc : 0)
}

/** SOH derived from usable vs. specified capacity. */
export function formatSohPercent(usableWh: number, specifiedWh: number): string {
    if (specifiedWh <= 0 || usableWh <= 0) {
        return '—'
    }
    const percent = (usableWh / specifiedWh) * 100
    return (Math.round(percent * 10) / 10).toFixed(1)
}