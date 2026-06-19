
export interface BatteryData {
    index: number
    capacity: number
    asoc: number
    /** Raw ASOC tag value before easy-rscp scaling (for diagnostics). */
    asocRaw?: number
    /** Usable capacity from BAT USABLE_CAPACITY (Ah × V → Wh), when available. */
    usableCapacityWh?: number
    /** Max emergency reserve energy — equals usable capacity on many units. */
    reserveMaxWh?: number
    /** Sum of DCB full-charge capacities converted to Wh. */
    dcbFullChargeWh?: number
    name: string
    maxChargingTempCelsius: number
    minChargingTempCelsius: number
    maxChargeCurrentA: number
    maxDischargeCurrentA: number
    designVoltage: number
    connected: boolean
    working: boolean
    inService: boolean
    voltage: number
    dcbs: DCBData[]
}

export interface DCBData {
    index: number,
    voltage: number;
    voltageAVG30s: number;
    currentA: number;
    currentAVG30s: number;
    temperaturesCelsius: number[];
}
