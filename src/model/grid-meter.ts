import {InternalDevice} from '../internal-api/internal-device';

export interface GridMeter extends InternalDevice {
  sync(gridPowerW: number): void
}