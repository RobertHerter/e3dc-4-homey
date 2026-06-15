# Wallbox

You can set up an extra device for each connected wallbox and display the live performance data
of the respective wallbox.

**Current capabilities (per wallbox device):**
- `measure_power` (W) – charging power; standard for `evcharger` and Homey Energy
- `measure_wallbox_solarshare` (W) – solar portion of the charging power
- `wallbox_charging` (sensor) – charging allowed / stopped; mapped from RSCP `EXTERN_DATA_ALG` (read-only on device tile)
- `wallbox_sun_mode` (sensor) – PV surplus mode; state from `EXTERN_DATA_ALG` status byte bit 7 (read-only on device tile)

System capability `evcharger_charging` is intentionally not used.

**Control (Flow cards — preferred; RSCP read-back before each command):**
- **Laden freigeben** (`wallbox_allow_charging`) – allow charging in mixed mode (optional max current, default 16 A)
- **Laden sperren** (`wallbox_block_charging`) – pause/stop charging
- **Sonnenmodus ein** (`wallbox_sun_mode_on`) – enable PV surplus mode (optional max current)
- **Sonnenmodus aus** (`wallbox_sun_mode_off`) – disable sun mode

Legacy cards **Start/Stop charging** and **Set sun mode** use the same guarded logic.

**Conditions (use before actions/notifications — flow branch stops when false):**
- **Sun mode is off** (`wallbox_sun_mode_is_off`) — then → sun mode on / notification
- **Sun mode is on** (`wallbox_sun_mode_is_active`) — then → sun mode off / notification
- **Charging is blocked** (`wallbox_charging_is_blocked`) — then → allow charging
- **Charging is allowed** (`wallbox_charging_is_allowed`) — then → block charging

Example (no duplicate notification when already on):

```
WHEN  [Wallbox] sun mode is off
THEN  [Wallbox] sun mode on
AND   Push notification "Sonnenmodus eingeschaltet"
```

Action cards still skip redundant RSCP commands if a condition was omitted (token `skipped: true`).
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

Status sensors are updated from this read-back on each HPS poll. Flow action cards call `applyChargingAllowed` / `applySunMode`, which read `EXTERN_DATA_ALG` first and skip the RSCP write when the wallbox is already in the requested state.

More data points (energy counters, phases as sensors, errors) can be added in future releases.