import {
    DefaultDataParser,
    DefaultWbExternalDataParser,
    Frame,
    FrameConverter,
    WBTag,
} from 'easy-rscp';
import {WallboxLiveState} from '../model/wallbox-live-state';
import {pickVehicleSocPercent, readVehicleSocFromBlocks} from '../utils/vehicle-soc';
import {WallboxExternAlgParser} from './wallbox-extern-alg-parser';

export class WallboxLiveStateConverter implements FrameConverter<WallboxLiveState[]> {
    private readonly parser = new DefaultDataParser();
    private readonly externalDataParser = new DefaultWbExternalDataParser(this.parser);
    private readonly algParser = new WallboxExternAlgParser(this.parser);

    convert(frame: Frame): WallboxLiveState[] {
        const result: WallboxLiveState[] = [];
        frame.data
            .filter(value => value.tag === WBTag.DATA)
            .forEach(dataBlock => {
                const childs = dataBlock.valueAsContainer(this.parser);
                const index = childs.find(child => child.tag === WBTag.INDEX)?.valueAsNumber();
                const sunRaw = childs.find(child => child.tag === WBTag.EXTERN_DATA_SUN);
                const allRaw = childs.find(child => child.tag === WBTag.EXTERN_DATA_ALL);
                const algRaw = childs.find(child => child.tag === WBTag.EXTERN_DATA_ALG);
                if (index === undefined || sunRaw === undefined || allRaw === undefined) {
                    return;
                }
                try {
                    const sun = this.externalDataParser.parseEnergyData(sunRaw);
                    const all = this.externalDataParser.parseEnergyData(allRaw);
                    const alg = algRaw ? this.algParser.parse(algRaw) : undefined;
                    const rscpSoc = readVehicleSocFromBlocks(childs, this.parser);
                    result.push({
                        id: index,
                        powerW: all.powerW,
                        totalEnergyWh: all.totalEnergyWh,
                        solarPowerW: sun.powerW,
                        socPercent: pickVehicleSocPercent(rscpSoc, alg?.socPercent),
                        socDiagnostics: {
                            rscpSocRaw: rscpSoc,
                            algPrecharge: alg?.socPercent,
                            algHex: alg?.rawHex,
                        },
                        activePhases: alg?.activePhases,
                        maxCurrentA: alg?.maxCurrentA,
                        sunModeActive: alg?.sunModeActive ?? false,
                        chargingCanceled: alg?.chargingCanceled ?? false,
                        chargingActive: alg?.chargingActive ?? false,
                        chargingEnabled: alg?.chargingEnabled ?? false,
                        plugged: alg?.plugged ?? false,
                        plugLocked: alg?.plugLocked ?? false,
                        schukoOn: alg?.schukoOn ?? false,
                    });
                } catch {
                    // ignore unparsable wallbox blocks
                }
            });
        return result;
    }
}