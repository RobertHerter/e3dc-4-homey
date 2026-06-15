import {
    DefaultDataParser,
    DefaultWbExternalDataParser,
    Frame,
    FrameConverter,
    WBTag,
} from 'easy-rscp';
import {WallboxLiveState} from '../model/wallbox-live-state';
import {WallboxExternAlgParser} from './wallbox-extern-alg-parser';

export class WallboxLiveStateConverter implements FrameConverter<WallboxLiveState[]> {
    private readonly externalDataParser = new DefaultWbExternalDataParser(new DefaultDataParser());
    private readonly algParser = new WallboxExternAlgParser();

    convert(frame: Frame): WallboxLiveState[] {
        const result: WallboxLiveState[] = [];
        frame.data
            .filter(value => value.tag === WBTag.DATA)
            .forEach(dataBlock => {
                const childs = dataBlock.valueAsContainer(new DefaultDataParser());
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
                    result.push({
                        id: index,
                        powerW: all.powerW,
                        solarPowerW: sun.powerW,
                        socPercent: alg?.socPercent,
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