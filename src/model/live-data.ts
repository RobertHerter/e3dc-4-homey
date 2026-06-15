import {ChargingConfiguration, EmergencyPowerState, ManualChargeState} from 'easy-rscp';
import {WallboxLiveState} from './wallbox-live-state';

export interface LiveData {
    pvDelivery: number
    gridDelivery: number
    batteryDelivery: number
    houseConsumption: number
    batteryChargingLevel: number
    firmwareVersion: string
    chargingConfig: ChargingConfiguration
    manualChargeState: ManualChargeState,
    emergencyPowerState: EmergencyPowerState,
    wallboxPowerState: WallboxLiveState[],
    wallboxCompleteConsumption: number,
    wallboxCompleteConsumptionSolarShare: number,
    externalPowerConnected: boolean,
    externalPowerDelivery: number,
}
