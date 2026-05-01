import Dexie, { Table } from 'dexie';
import { logger } from '@/utils/logger';

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const MAX_ENTRIES = 500;
const CLEANUP_BATCH = 100;

// ---------------------------------------------------------------------------

export interface TranslationEntry {
    id?: number;
    cacheKey: string;      // format: "from-to-originalText"
    originalText: string;
    translatedText: string;
    fromLang: string;
    toLang: string;
    timestamp: number;
}

class TranslationVaultClass extends Dexie {
    translations!: Table<TranslationEntry>;

    constructor() {
        super('GonepalTranslationVault');
        this.version(1).stores({
            translations: '++id, cacheKey, originalText, toLang, timestamp'
        });
    }
}

// Create singleton instance
export const translationVault = new TranslationVaultClass();

/**
 * Enforce LRU cleanup: if translations > MAX_ENTRIES, delete oldest CLEANUP_BATCH
 * Called automatically after each insert
 */
async function enforceSizeLimit(): Promise<void> {
    try {
        const count = await translationVault.translations.count();
        if (count > MAX_ENTRIES) {
            // Get oldest entries (sorted by timestamp ascending)
            const oldest = await translationVault.translations
                .orderBy('timestamp')
                .limit(CLEANUP_BATCH)
                .toArray();

            if (oldest.length > 0) {
                const ids = oldest.map(e => e.id!).filter((id): id is number => id !== undefined);
                await translationVault.translations.bulkDelete(ids);
                logger.log(`[TranslationVault] LRU cleanup: removed ${ids.length} oldest entries (total was ${count})`);
            }
        }
    } catch (error) {
        logger.error('[TranslationVault] Cleanup failed:', error);
    }
}

/**
 * Save translation to Dexie vault for offline use
 * (Used by translationService.ts)
 */
export const saveTranslation = async (
    cacheKey: string,
    originalText: string,
    translatedText: string,
    fromLang: string,
    toLang: string
): Promise<void> => {
    try {
        await translationVault.translations.add({
            cacheKey,
            originalText,
            translatedText,
            fromLang,
            toLang,
            timestamp: Date.now()
        });
        // Enforce size limit immediately after insert
        await enforceSizeLimit();
    } catch (error) {
        logger.error('[TranslationVault] Error saving:', error);
    }
};

/**
 * Clear all cached translations (useful for testing or language switch)
 */
export const clearTranslationVault = async (): Promise<void> => {
    await translationVault.translations.clear();
};

/**
 * Get translation count in vault
 */
export const getVaultSize = async (): Promise<number> => {
    return await translationVault.translations.count();
};

/**
 * Check if we're online
 */
export const isOnline = (): boolean => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
};
