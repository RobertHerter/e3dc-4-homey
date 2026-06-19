import {BatteryData} from '../model/battery-data';

/** Usable full-charge capacity (ASOC) in Wh; falls back to specified capacity. */
export function resolveUsableCapacityWh(battery: BatteryData): number {
    if (battery.asoc > 0) {
        return battery.asoc
    }
    return battery.capacity
}

/** SOH derived from ASOC vs. specified capacity when no native SOH is available. */
export function formatSohPercent(asocWh: number, specifiedWh: number): string {
    if (specifiedWh <= 0 || asocWh <= 0) {
        return '—'
    }
    const percent = (asocWh / specifiedWh) * 100
    return (Math.round(percent * 10) / 10).toFixed(1)
}