import Homey from 'homey';
import {formatError} from './error-utils';

export async function ensureCapabilities(device: Homey.Device, capabilities: string[]): Promise<void> {
  for (const capability of capabilities) {
    if (device.hasCapability(capability)) {
      continue;
    }
    try {
      await device.addCapability(capability);
      device.log(`Added capability ${capability}`);
    } catch (error) {
      device.error(`Failed to add capability ${capability}: ${formatError(error)}`);
    }
  }
}