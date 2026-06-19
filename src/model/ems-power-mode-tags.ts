/**
 * EMS tags for power mode control, not yet exposed in easy-rscp EMSTag enum.
 * Source: rscp2mqtt RscpTags.h
 */

// TAG_EMS_REQ_SET_POWER container and sub-tags
export const EMS_REQ_SET_POWER = '01000030'
export const EMS_SET_POWER = '01800030'
export const EMS_REQ_SET_POWER_MODE = '01000031'   // uchar8: 0=auto, 1=idle, 2=discharge, 3=charge, 4=grid_charge
export const EMS_REQ_SET_POWER_VALUE = '01000032'  // int32: power in W
