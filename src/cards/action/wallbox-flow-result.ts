import {WallboxCommandResult} from '../../model/wallbox';

export function resolveWallboxFlowResult(
    result: WallboxCommandResult,
    payload: Record<string, unknown>,
    rejectMessage: string,
    resolve: (value: unknown) => void,
    reject: (reason?: unknown) => void,
): void {
    if (!result.ok) {
        reject(rejectMessage);
        return;
    }
    resolve({ ...payload, skipped: result.skipped });
}