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
    try {
        return JSON.stringify(reason);
    } catch {
        return String(reason);
    }
}