/**
 * A safe wrapper for localStorage that falls back to an in-memory store
 * if localStorage is unavailable (e.g., private browsing, browser settings).
 */

const memoryStorage: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        const testKey = '__storage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch (e) {
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
            // Fallback to memory
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
            // Fallback to memory
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
            // Fallback to memory
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
            // Fallback to memory
        }
        for (const key in memoryStorage) {
            delete memoryStorage[key];
        }
    }
};
