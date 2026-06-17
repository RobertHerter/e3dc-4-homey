/** System-wide E3/DC EMS Ladepriorisierung (portal mask), same for all wallboxes. */
export interface WallboxEmsSettings {
  /** true = Batterie zuerst (sun mode priority). */
  batteryBeforeCar: boolean;
  /** true = battery discharge for EV allowed in sun mode. */
  batteryToCarAllowed: boolean;
  /** Min. home battery SOC (%) for EV discharge — portal „Bis Ladezustand“. */
  dischargeBatteryUntilPercent: number;
  /** true = battery discharge blocked in mixed mode (portal „Unterbunden“). */
  batteryDischargeMixBlocked: boolean;
}
