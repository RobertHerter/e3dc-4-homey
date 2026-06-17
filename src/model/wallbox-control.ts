/** RSCP WBTag REQ_SET_MODE mode values (E3/DC wallbox). */
export const WALLBOX_MODE_STOP = 0;
export const WALLBOX_MODE_SUN = 1;
export const WALLBOX_MODE_MIXED = 2;

/** EXTERN_DATA byte 1 – charging strategy (ioBroker e3dc-rscp). */
export const WALLBOX_EXTERN_SUN_MODE = 1;
export const WALLBOX_EXTERN_MIXED_MODE = 2;

export const DEFAULT_WALLBOX_CURRENT_A = 16;

/** EXTERN_DATA byte count for REQ_SET_EXTERN writes. */
export const WALLBOX_EXTERN_DATA_LEN = 6;

/** EXTERN_DATA_ALG read buffer length per E3DC RscpTags (8 bytes). */
export const WALLBOX_EXTERN_DATA_ALG_LEN = 8;