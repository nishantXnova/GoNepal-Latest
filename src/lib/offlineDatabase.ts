// ============================================================================
// NOT INTEGRATED — SCHEMA REFERENCE ONLY
// ============================================================================
// This file defines the GonepalOfflineDB schema for Phase 3 (offline maps).
// It is NOT imported by any active route and the database is never instantiated.
// Do NOT use this for current storage needs — use the dedicated caches below:
//   - GonepalTranslationVault (translationVault.ts)
//   - GonepalNewsCache (newsCache.ts)
//   - GonepalCurrencyCache (currencyCache.ts)
// Preserved as a reference for PMTiles + pinned locations schema design.
//
// Author: Nishant (original), kept for Phase 3 reference
// ============================================================================

import Dexie, { Table } from 'dexie';
import { logger } from '@/utils/logger';

/**
 * GonePal Offline Database - Unified IndexedDB storage
 * Stores phrases, news, and translations for offline use at high altitudes
 */

// ============================================================================
// Types
// ============================================================================

export interface PhraseEntry {
  id?: number;
  english: string;
  nepali: string;
  pronunciation: string;
  category: string;
  cachedAt: number;
}

export interface NewsCacheItem {
  id?: number;
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  source: string;
  isEmergency: boolean;
  lastUpdated: string;
  cachedAt: number;
}

export interface TranslationCacheEntry {
  id?: number;
  key: string;
  original: string;
  translated: string;
  fromLang: string;
  toLang: string;
  cachedAt: number;
}

export interface MapTileCache {
  id?: number;
  url: string;
  zoom: number;
  x: number;
  y: number;
  blob: Blob;
  cachedAt: number;
}

export interface SecureLocationEntry {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  isHomeBase: boolean;
  createdAt: Date;
}

// ============================================================================
// Database Class
// ============================================================================

class GonepalOfflineDB extends Dexie {
  phrases!: Table<PhraseEntry>;
  news!: Table<NewsCacheItem>;
  translations!: Table<TranslationCacheEntry>;
  mapTiles!: Table<MapTileCache>;
  pinnedLocations!: Table<SecureLocationEntry>;

  constructor() {
    super('GonepalOfflineDB');
    this.version(1).stores({
      phrases: '++id, english, category, cachedAt',
      news: '++id, title, isEmergency, cachedAt',
      translations: '++id, key, fromLang, toLang, cachedAt',
      mapTiles: '++id, url, zoom, x, y, cachedAt',
      pinnedLocations: '++id, name, latitude, longitude, isHomeBase, createdAt'
    });
  }
}

// Create singleton instance
export const offlineDB = new GonepalOfflineDB();

// ============================================================================
// Phrases CRUD
// ============================================================================

/**
 * Cache phrases for offline use
 */
export const cachePhrases = async (phrases: PhraseEntry[]): Promise<void> => {
  try {
    await offlineDB.phrases.clear();
    const phrasesWithTimestamp = phrases.map(p => ({
      ...p,
      cachedAt: Date.now()
    }));
    await offlineDB.phrases.bulkAdd(phrasesWithTimestamp);
    logger.log(`[OfflineDB] Cached ${phrases.length} phrases`);
  } catch (error) {
    logger.error('[OfflineDB] Error caching phrases:', error);
  }
};

/**
 * Get all cached phrases
 */
export const getCachedPhrases = async (): Promise<PhraseEntry[]> => {
  return await offlineDB.phrases.toArray();
};

/**
 * Get phrases by category
 */
export const getPhrasesByCategory = async (category: string): Promise<PhraseEntry[]> => {
  if (category === 'All') {
    return await offlineDB.phrases.toArray();
  }
  return await offlineDB.phrases.where('category').equals(category).toArray();
};

/**
 * Search phrases
 */
export const searchPhrases = async (query: string): Promise<PhraseEntry[]> => {
  const lowerQuery = query.toLowerCase();
  const all = await offlineDB.phrases.toArray();
  return all.filter(p => 
    p.english.toLowerCase().includes(lowerQuery) ||
    p.nepali.includes(query) ||
    p.pronunciation.toLowerCase().includes(lowerQuery)
  );
};

// ============================================================================
// News CRUD (enhanced from existing newsCache.ts)
// ============================================================================

/**
 * Cache news items for offline use
 */
export const cacheNews = async (items: NewsCacheItem[]): Promise<void> => {
  try {
    await offlineDB.news.clear();
    const itemsWithTimestamp = items.map(item => ({
      ...item,
      cachedAt: Date.now()
    }));
    await offlineDB.news.bulkAdd(itemsWithTimestamp);
    logger.log(`[OfflineDB] Cached ${items.length} news items`);
  } catch (error) {
    logger.error('[OfflineDB] Error caching news:', error);
  }
};

/**
 * Get cached news items
 */
export const getCachedNews = async (): Promise<NewsCacheItem[]> => {
  return await offlineDB.news.toArray();
};

/**
 * Get emergency news only
 */
export const getEmergencyNews = async (): Promise<NewsCacheItem[]> => {
  return await offlineDB.news
    .where('isEmergency')
    .equals(1)
    .toArray();
};

/**
 * Check if cache is fresh (less than 1 hour old)
 */
export const isCacheFresh = async (): Promise<boolean> => {
  const items = await offlineDB.news.toArray();
  if (items.length === 0) return false;
  
  const oldestItem = items[0];
  const hourInMs = 60 * 60 * 1000;
  return (Date.now() - oldestItem.cachedAt) < hourInMs;
};

// ============================================================================
// Translations CRUD (enhanced from existing translationVault.ts)
// ============================================================================

/**
 * Save translation to offline cache
 */
export const cacheTranslation = async (
  key: string,
  original: string,
  translated: string,
  fromLang: string,
  toLang: string
): Promise<void> => {
  try {
    await offlineDB.translations.add({
      key,
      original,
      translated,
      fromLang,
      toLang,
      cachedAt: Date.now()
    });
  } catch (error) {
    logger.error('[OfflineDB] Error caching translation:', error);
  }
};

/**
 * Get cached translation
 */
export const getCachedTranslation = async (
  key: string,
  fromLang: string,
  toLang: string
): Promise<string | null> => {
  const entry = await offlineDB.translations
    .where(['key', 'fromLang', 'toLang'])
    .equals([key, fromLang, toLang])
    .first();
  return entry?.translated || null;
};

/**
 * Get translation vault size
 */
export const getTranslationVaultSize = async (): Promise<number> => {
  return await offlineDB.translations.count();
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = async (): Promise<void> => {
  await offlineDB.translations.clear();
};

// ============================================================================
// Map Tile Caching
// ============================================================================

/**
 * Save map tile to offline storage
 */
export const cacheMapTile = async (
  url: string,
  zoom: number,
  x: number,
  y: number,
  blob: Blob
): Promise<void> => {
  try {
    // Delete old tiles if storage is getting full
    const tileCount = await offlineDB.mapTiles.count();
    if (tileCount > 5000) {
      // Remove oldest 1000 tiles
      const oldest = await offlineDB.mapTiles.orderBy('cachedAt').limit(1000).toArray();
      const ids = oldest.map(t => t.id).filter((id): id is number => id !== undefined);
      await offlineDB.mapTiles.bulkDelete(ids);
      logger.log('[OfflineDB] Cleaned up old map tiles');
    }

    await offlineDB.mapTiles.add({
      url,
      zoom,
      x,
      y,
      blob,
      cachedAt: Date.now()
    });
  } catch (error) {
    logger.error('[OfflineDB] Error caching map tile:', error);
  }
};

/**
 * Get cached map tile
 */
export const getCachedMapTile = async (
  url: string
): Promise<Blob | null> => {
  const tile = await offlineDB.mapTiles.where('url').equals(url).first();
  return tile?.blob || null;
};

/**
 * Get cached tile count
 */
export const getCachedTileCount = async (): Promise<number> => {
  return await offlineDB.mapTiles.count();
};

// ============================================================================
// Sync Utilities
// ============================================================================

/**
 * Check if online
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// Pinned Locations functions
export interface SecureLocationEntry {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  isHomeBase: boolean;
  createdAt: Date;
}

export const savePinnedLocation = async (location: Omit<SecureLocationEntry, 'id'>): Promise<number> => {
  try {
    return await offlineDB.pinnedLocations.add(location as SecureLocationEntry);
  } catch (error) {
    console.error('[OfflineDB] Error saving pinned location:', error);
    return -1;
  }
};

export const getPinnedLocations = async (): Promise<SecureLocationEntry[]> => {
  try {
    return await offlineDB.pinnedLocations.toArray();
  } catch (error) {
    console.error('[OfflineDB] Error getting pinned locations:', error);
    return [];
  }
};

export const getHomeBaseLocation = async (): Promise<SecureLocationEntry | undefined> => {
  try {
    const locations = await offlineDB.pinnedLocations.toArray();
    return locations.find(loc => loc.isHomeBase);
  } catch (error) {
    console.error('[OfflineDB] Error getting home base:', error);
    return undefined;
  }
};

export const deletePinnedLocation = async (id: number): Promise<void> => {
  try {
    await offlineDB.pinnedLocations.delete(id);
  } catch (error) {
    console.error('[OfflineDB] Error deleting pinned location:', error);
  }
};

/**
 * Sync data from Supabase when online
 * This should be called on app launch
 */
export const syncFromSupabase = async (
  supabaseClient: unknown,
  fetchPhrasesFn: () => Promise<PhraseEntry[]>,
  fetchNewsFn: () => Promise<NewsCacheItem[]>
): Promise<void> => {
  if (!isOnline()) {
    logger.log('[OfflineDB] Offline - skipping sync');
    return;
  }

  try {
    logger.log('[OfflineDB] Starting sync from Supabase...');
    
    // Sync phrases
    try {
      const phrases = await fetchPhrasesFn();
      if (phrases.length > 0) {
        await cachePhrases(phrases);
        logger.log(`[OfflineDB] Synced ${phrases.length} phrases`);
      }
    } catch (error) {
      logger.warn('[OfflineDB] Phrase sync failed:', error);
    }

    // Sync news
    try {
      const news = await fetchNewsFn();
      if (news.length > 0) {
        await cacheNews(news);
        logger.log(`[OfflineDB] Synced ${news.length} news items`);
      }
    } catch (error) {
      logger.warn('[OfflineDB] News sync failed:', error);
    }

    logger.log('[OfflineDB] Sync complete');
  } catch (error) {
    logger.error('[OfflineDB] Sync error:', error);
  }
};

/**
 * Clear all offline data
 */
export const clearAllOfflineData = async (): Promise<void> => {
  await Promise.all([
    offlineDB.phrases.clear(),
    offlineDB.news.clear(),
    offlineDB.translations.clear(),
    offlineDB.mapTiles.clear()
  ]);
  logger.log('[OfflineDB] All offline data cleared');
};
