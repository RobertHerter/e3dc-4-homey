/** E3/DC portal dropdown values for Ladepriorisierung (matches E3/DC mask wording). */
export function isErlaubt(permission: unknown, legacyEnabled?: unknown): boolean {
    if (permission !== undefined && permission !== null && permission !== '') {
        return permission === 'erlaubt';
    }
    return !!legacyEnabled;
}

export function isUnterbunden(permission: unknown, legacyEnabled?: unknown): boolean {
    if (permission !== undefined && permission !== null && permission !== '') {
        return permission === 'unterbunden';
    }
    return !!legacyEnabled;
}

export function isBatteryFirst(priority: unknown, legacyEnabled?: unknown): boolean {
    if (priority !== undefined && priority !== null && priority !== '') {
        return priority === 'batterie_zuerst';
    }
    return !!legacyEnabled;
}