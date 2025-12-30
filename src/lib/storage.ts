/**
 * A safe wrapper for localStorage that falls back to an in-memory store
 * if localStorage is unavailable (e.g., private browsing, browser settings, or full disk).
 */

const memoryStorage: Record<string, string> = {};

const IS_DEV = import.meta.env.DEV;

function isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        const testKey = '__storage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        if (IS_DEV) {
            console.warn('[Storage] localStorage is not available, falling back to memory storage:', e);
        }
        return false;
    }
}

const isAvailable = isLocalStorageAvailable();

export const storage = {
    getItem(key: string): string | null {
        try {
            if (isAvailable) {
                return window.localStorage.getItem(key);
            }
        } catch (e) {
            if (IS_DEV) {
                console.error(`[Storage] Error getting item "${key}":`, e);
            }
        }
        return memoryStorage[key] || null;
    },

    setItem(key: string, value: string): void {
        try {
            if (isAvailable) {
                window.localStorage.setItem(key, value);
                return;
            }
        } catch (e) {
            if (IS_DEV) {
                console.error(`[Storage] Error setting item "${key}":`, e);
            }
        }
        memoryStorage[key] = value;
    },

    removeItem(key: string): void {
        try {
            if (isAvailable) {
                window.localStorage.removeItem(key);
                return;
            }
        } catch (e) {
            if (IS_DEV) {
                console.error(`[Storage] Error removing item "${key}":`, e);
            }
        }
        delete memoryStorage[key];
    },

    clear(): void {
        try {
            if (isAvailable) {
                window.localStorage.clear();
                return;
            }
        } catch (e) {
            if (IS_DEV) {
                console.error('[Storage] Error clearing storage:', e);
            }
        }
        for (const key in memoryStorage) {
            delete memoryStorage[key];
        }
    }
};
