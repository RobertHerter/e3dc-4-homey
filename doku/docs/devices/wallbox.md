# Wallbox

You can set up an extra device for each connected wallbox and display the live performance data
of the respective wallbox.

**Current capabilities (per wallbox device):**
- `measure_power` (W) – standard power, great for Homey Energy insights/dashboards
- `measure_wallbox_consumption` (W)
- `measure_wallbox_solarshare` (W) – solar portion of the charging power
- `wallbox_charging` (button) – charging allowed / stopped; mapped from RSCP `EXTERN_DATA_ALG` (bit 6 = canceled)
- `wallbox_sun_mode` (button) – PV surplus mode; state from `EXTERN_DATA_ALG` status byte bit 7

Both use `uiComponent: "button"` so they appear on the **same device page** (no dropdown, no extra tab). System capability `evcharger_charging` is intentionally not used — it occupies the main EV view and pushes other controls to a second page.

**Control (Flow cards):**
- **Start wallbox charging** – enable charging in mixed mode (optional max current, default 16 A)
- **Stop wallbox charging** – pause/stop charging (RSCP `EXTERN_DATA` abort byte)
- **Set wallbox sun mode** – PV surplus (sun) mode on or off (optional max current)
- **Set wallbox charging current** – low-level: set max current in A and mode (0=stop, 1=Sun/PV, …)

The sun/start/stop actions use `WBTag.REQ_SET_EXTERN` (same approach as the ioBroker e3dc-rscp adapter).
The advanced current card uses `WBTag.REQ_SET_MODE`.

**Tips:**
- Activate RSCP password on your E3/DC as described in the main docs.
- Wallbox devices are discovered via the already paired HPS device(s).
- Test flows with your real wallbox – firmware variants may behave slightly differently.
- Enable debug mode on the HPS device if a command fails; RSCP requests are then logged.

**EXTERN_DATA_ALG (6 bytes, read via `WBTag.REQ_EXTERN_DATA_ALG`):**

| Index | Meaning |
|------:|---------|
| 0 | Vehicle SOC (%) |
| 1 | Active phases |
| 2 | Status byte (bit 7 = sun mode, bit 6 = charging canceled, bit 5 = charging active, bit 4 = plug locked, bit 3 = plugged) |
| 3 | Max charge current (A) |
| 5 | Schuko outlet on |

Toggle states are updated from this read-back on each HPS poll. User toggles send the same RSCP commands as the Flow cards; sync is briefly paused after a manual change to avoid flicker.

More data points (energy counters, phases as sensors, errors) can be added in future releases.