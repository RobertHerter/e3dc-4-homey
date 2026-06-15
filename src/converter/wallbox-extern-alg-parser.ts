import {Data, DataParser, DefaultDataParser, WBTag} from 'easy-rscp';
import {WALLBOX_EXTERN_DATA_LEN, WALLBOX_EXTERN_SUN_MODE} from '../model/wallbox-control';
import {
    WB_ALG_STATUS_CHARGING_ACTIVE,
    WB_ALG_STATUS_CHARGING_CANCELED,
    WB_ALG_STATUS_PLUG_LOCKED,
    WB_ALG_STATUS_PLUGGED,
    WB_ALG_STATUS_SUN_MODE,
} from '../model/wallbox-extern-alg-status';

export interface WallboxExternAlgParsed {
    socPercent: number;
    activePhases: number;
    statusByte: number;
    maxCurrentA: number;
    schukoOn: boolean;
    sunModeActive: boolean;
    chargingCanceled: boolean;
    chargingActive: boolean;
    plugLocked: boolean;
    plugged: boolean;
    chargingEnabled: boolean;
}

export class WallboxExternAlgParser {
    constructor(private readonly parser: DataParser = new DefaultDataParser()) {
    }

    parse(algBlock: Data): WallboxExternAlgParsed | undefined {
        if (algBlock.tag !== WBTag.EXTERN_DATA_ALG) {
            return undefined;
        }
        const byteBlock = algBlock.valueAsContainer(this.parser)
            .find(value => value.tag === WBTag.EXTERN_DATA);
        if (byteBlock === undefined || byteBlock.size() < WALLBOX_EXTERN_DATA_LEN) {
            return undefined;
        }
        const buffer = Buffer.from(byteBlock.valueAsHex, 'hex');
        const modeByte = buffer.readUInt8(0);
        const statusByte = buffer.readUInt8(2);
        const abortByte = buffer.readUInt8(4);
        const chargingCanceled = (statusByte & WB_ALG_STATUS_CHARGING_CANCELED) !== 0 || abortByte === 1;
        const chargingActive = (statusByte & WB_ALG_STATUS_CHARGING_ACTIVE) !== 0;
        const sunModeActive = (statusByte & WB_ALG_STATUS_SUN_MODE) !== 0
            || modeByte === WALLBOX_EXTERN_SUN_MODE;
        return {
            socPercent: modeByte,
            activePhases: buffer.readUInt8(1),
            statusByte,
            maxCurrentA: buffer.readUInt8(3),
            schukoOn: buffer.readUInt8(5) !== 0,
            sunModeActive,
            chargingCanceled,
            chargingActive,
            plugLocked: (statusByte & WB_ALG_STATUS_PLUG_LOCKED) !== 0,
            plugged: (statusByte & WB_ALG_STATUS_PLUGGED) !== 0,
            chargingEnabled: !chargingCanceled,
        };
    }
}