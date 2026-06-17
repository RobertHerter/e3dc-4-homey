import {WallboxPowerState} from 'easy-rscp';

export interface WallboxSocDiagnostics {
    rscpSocRaw?: number;
    algPrecharge?: number;
    algHex?: string;
    chargePlanText?: string;
    chargePlanSoc?: number;
    runscreenPercentTexts?: string[];
}

/** Live wallbox data including power readings and EXTERN_DATA_ALG control status. */
export interface WallboxLiveState extends WallboxPowerState {
    totalEnergyWh?: number;
    socPercent: number | undefined;
    socDiagnostics?: WallboxSocDiagnostics;
    activePhases: number | undefined;
    maxCurrentA: number | undefined;
    sunModeActive: boolean;
    chargingCanceled: boolean;
    chargingActive: boolean;
    /** Charging permitted (not manually stopped). */
    chargingEnabled: boolean;
    plugged: boolean;
    plugLocked: boolean;
    schukoOn: boolean;
}