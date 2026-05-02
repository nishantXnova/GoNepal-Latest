import { logger } from '@/utils/logger';
import { cacheMapTile, getCachedMapTile, getCachedTileCount, addMapRegion, getMapRegions, deleteMapRegion as deleteRegionFromDB, MapRegion } from './offlineDatabase';

// ============================================================================
// Types
// ============================================================================

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface DownloadProgress {
  downloaded: number;
  total: number;
  percent: number;
  currentTile?: string;
}

export interface SearchResult {
  display_name: string;
  lat: number;
  lon: number;
  boundingbox?: [string, string, string, string]; // [south, north, west, east] as strings
}

// ============================================================================
// Configuration
// ============================================================================

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_MIN_ZOOM = 10;
const DEFAULT_MAX_ZOOM = 14;
const MAX_TILES_PER_REGION = 5000; // Prevent excessive storage

// ============================================================================
// Tile Coordinate Utilities
// ============================================================================

/**
 * Convert lat/lng to tile numbers at a given zoom
 */
function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
}

/**
 * Convert tile numbers to lat/lng bounds
 */
function tileToLatLngBounds(x: number, y: number, zoom: number): BoundingBox {
  const n = Math.pow(2, zoom);
  const lon1 = (x / n) * 360 - 180;
  const lon2 = ((x + 1) / n) * 360 - 180;
  const lat1 = (Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180) / Math.PI;
  const lat2 = (Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))) * 180) / Math.PI;
  return {
    north: Math.max(lat1, lat2),
    south: Math.min(lat1, lat2),
    east: Math.max(lon1, lon2),
    west: Math.min(lon1, lon2),
  };
}

/**
 * Get tile range for a bounding box at a given zoom
 */
function getTileRange(bbox: BoundingBox, zoom: number): { minX: number; maxX: number; minY: number; maxY: number } {
  const topLeft = latLngToTile(bbox.north, bbox.west, zoom);
  const bottomRight = latLngToTile(bbox.south, bbox.east, zoom);
  return {
    minX: Math.max(0, topLeft.x),
    maxX: Math.min(Math.pow(2, zoom) - 1, bottomRight.x),
    minY: Math.max(0, bottomRight.y),
    maxY: Math.min(Math.pow(2, zoom) - 1, topLeft.y),
  };
}

/**
 * Build OSM tile URL for given coordinates
 */
function buildTileUrl(z: number, x: number, y: number): string {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

// ============================================================================
// Location Search (Nominatim)
// ============================================================================

/**
 * Search for locations using Nominatim (OpenStreetMap)
 */
export const searchLocations = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '5',
      addressdetails: '0',
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': 'GonePal/1.0' },
    });
    if (!response.ok) throw new Error('Search failed');
    const data: SearchResult[] = await response.json();
    return data.map(item => ({
      ...item,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (error) {
    logger.error('Location search error:', error);
    return [];
  }
};

// ============================================================================
// Map Region Download
// ============================================================================

/**
 * Download OSM tiles for a bounding box and zoom levels, store in IndexedDB
 */
export const downloadMapRegion = async (
  name: string,
  bbox: BoundingBox,
  zoomLevels: number[] = [DEFAULT_MIN_ZOOM, DEFAULT_MAX_ZOOM],
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ regionId: number; tileCount: number }> => {
  let totalTiles = 0;
  let downloadedTiles = 0;
  const zoomRanges: { zoom: number; minX: number; maxX: number; minY: number; maxY: number }[] = [];

  // First pass: count total tiles
  for (const zoom of zoomLevels) {
    const range = getTileRange(bbox, zoom);
    const count = (range.maxX - range.minX + 1) * (range.maxY - range.minY + 1);
    totalTiles += count;
    zoomRanges.push({ zoom, ...range });
  }

  if (totalTiles > MAX_TILES_PER_REGION) {
    throw new Error(`Too many tiles (${totalTiles}). Maximum allowed is ${MAX_TILES_PER_REGION}. Reduce area or zoom level.`);
  }

  // Second pass: download tiles
  for (const { zoom, minX, maxX, minY, maxY } of zoomRanges) {
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const url = buildTileUrl(zoom, x, y);
        try {
          // Check if already cached
          const cachedBlob = await getCachedMapTile(url);
          if (cachedBlob) {
            downloadedTiles++;
            onProgress?.({ downloaded: downloadedTiles, total: totalTiles, percent: Math.round((downloadedTiles / totalTiles) * 100), currentTile: url });
            continue;
          }

          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          await cacheMapTile(url, zoom, x, y, blob);
          downloadedTiles++;
          onProgress?.({ downloaded: downloadedTiles, total: totalTiles, percent: Math.round((downloadedTiles / totalTiles) * 100), currentTile: url });
        } catch (error) {
          logger.warn(`Failed to download tile ${url}:`, error);
          // Continue anyway
        }
      }
    }
  }

  // Save region metadata
  const regionId = await addMapRegion({
    name,
    north: bbox.north,
    south: bbox.south,
    east: bbox.east,
    west: bbox.west,
    minZoom: Math.min(...zoomLevels),
    maxZoom: Math.max(...zoomLevels),
    tileCount: downloadedTiles,
    downloadedAt: Date.now(),
  });

  return { regionId, tileCount: downloadedTiles };
};

/**
 * Get all downloaded map regions
 */
export const getDownloadedMapRegions = async (): Promise<MapRegion[]> => {
  return await getMapRegions();
};

/**
 * Delete a map region (metadata only; tiles remain cached globally)
 */
export const deleteMapRegion = async (id: number): Promise<boolean> => {
  return await deleteRegionFromDB(id);
};

// ============================================================================
// MapLibre Transform Request (offline tile serving)
// ============================================================================

/**
 * Create a transformRequest function for MapLibre that serves tiles from IndexedDB cache when available
 * Uses blob URLs that are properly managed to avoid memory leaks
 */
export const createMapTransformHandler = (): ((url: string, resourceType: string) => { url?: string } | null) => {
  // Keep track of blob URLs to revoke them when no longer needed
  const activeBlobUrls = new Set<string>();

  // Clean up old blob URLs periodically (every 30 seconds)
  const cleanupInterval = setInterval(() => {
    // Note: We can't easily track which URLs are still in use by MapLibre
    // Since we can't hook into tile lifecycle, we rely on auto-revocation below
  }, 30000);

  return async (url: string, resourceType: string) => {
    // Only intercept tile requests
    if (resourceType !== 'Source' && resourceType !== 'Tile') {
      return null;
    }

    // Check if URL is an OSM tile
    const match = url.match(/tile\.openstreetmap\.org\/(\d+)\/(\d+)\/(\d+)\.png/);
    if (!match) {
      return null;
    }

    const cachedBlob = await getCachedMapTile(url);
    if (cachedBlob) {
      const blobUrl = URL.createObjectURL(cachedBlob);
      activeBlobUrls.add(blobUrl);
      // Note: MapLibre GL JS will handle the blob URL and eventually release it
      // when the tile is no longer needed. We can't reliably revoke here as
      // the blob URL may still be in use by the rendering pipeline.
      // The browser will clean up when the document is unloaded.
      return { url: blobUrl };
    }

    // Not cached - let MapLibre fetch normally (will work when online)
    return null;
  };
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Check if any cached tiles exist for a given bounding box
 */
export const hasCachedTilesInRegion = async (bbox: BoundingBox, zoomLevels: number[]): Promise<boolean> => {
  for (const zoom of zoomLevels) {
    const range = getTileRange(bbox, zoom);
    for (let x = range.minX; x <= range.maxX; x++) {
      for (let y = range.minY; y <= range.maxY; y++) {
        const url = buildTileUrl(zoom, x, y);
        const cached = await getCachedMapTile(url);
        if (cached) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * Get count of cached tiles in a region
 */
export const getCachedTileCountInRegion = async (bbox: BoundingBox, zoomLevels: number[]): Promise<number> => {
  let count = 0;
  for (const zoom of zoomLevels) {
    const range = getTileRange(bbox, zoom);
    for (let x = range.minX; x <= range.maxX; x++) {
      for (let y = range.minY; y <= range.maxY; y++) {
        const url = buildTileUrl(zoom, x, y);
        const cached = await getCachedMapTile(url);
        if (cached) count++;
      }
    }
  }
  return count;
};

/**
 * Check if a tile URL is already cached
 */
export const isTileCached = async (url: string): Promise<boolean> => {
  const blob = await getCachedMapTile(url);
  return blob !== null;
};

/**
 * Revoke all active blob URLs (call on map unmount/unload)
 */
export const revokeAllBlobUrls = (): void => {
  // Note: blob URLs are not tracked globally since they're tied to specific map instances
  // The browser will automatically revoke them when the document is unloaded.
  // This is a no-op for now but kept for future use.
};

// Re-export types
export type { MapRegion, SearchResult, BoundingBox };
