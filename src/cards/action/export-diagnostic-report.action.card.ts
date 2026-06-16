import {RunListener} from '../run-listener';
import {HomePowerStation} from '../../model/home-power-station';

export class ExportDiagnosticReportActionCard implements RunListener {
    run(args: { device?: HomePowerStation }, _state: unknown): Promise<{ 'diagnostic report': string }> {
        return new Promise((resolve, reject) => {
            const hps = args.device;
            if (!hps || typeof hps.buildDiagnosticReport !== 'function') {
                reject('Invalid home power station device');
                return;
            }
            hps.buildDiagnosticReport()
                .then(report => resolve({ 'diagnostic report': report }))
                .catch(reason => reject(reason));
        });
    }
}