/** Readable string for logs / Homey error() — avoids "[object Object]" for Error/plain objects. */
export function formatError(reason: unknown): string {
    if (reason instanceof Error) {
        const stack = reason.stack?.trim();
        return stack ? `${reason.message}\n${stack}` : reason.message;
    }
    if (typeof reason === 'string') {
        return reason;
    }
    if (reason === null || reason === undefined) {
        return String(reason);
    }
    if (typeof reason === 'object') {
        const record = reason as Record<string, unknown>;
        if (typeof record.message === 'string') {
            const name = typeof record.name === 'string' ? record.name : 'Error';
            return `${name}: ${record.message}`;
        }
    }
    try {
        return JSON.stringify(reason);
    } catch {
        return String(reason);
    }
}

/** Turn easy-rscp / socket plain-object rejections into real Errors for Homey crash UI. */
export function normalizeError(reason: unknown): Error {
    if (reason instanceof Error) {
        return reason;
    }
    if (typeof reason === 'string') {
        return new Error(reason);
    }
    if (typeof reason === 'object' && reason !== null) {
        const record = reason as Record<string, unknown>;
        if (typeof record.message === 'string') {
            const err = new Error(record.message);
            if (typeof record.name === 'string') {
                err.name = record.name;
            }
            return err;
        }
    }
    return new Error(formatError(reason));
}

export function rejectAsError(reject: (reason?: unknown) => void, reason: unknown): void {
    reject(normalizeError(reason));
}