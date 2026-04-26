# GoNepal Offline Architecture: Comprehensive Technical Explanation

## Overview

GoNepal implements a sophisticated offline-first architecture designed to provide critical functionality for trekkers in remote Nepalese regions with limited or no internet connectivity. The system combines IndexedDB storage, service workers, localStorage, and intelligent caching strategies to ensure maps, emergency information, translation services, and trip data remain accessible offline.

## Core Components

### 1. Unified Offline Database (IndexedDB)

Located in: `src/lib/offlineDatabase.ts`

The foundation of GoNepal's offline capabilities is a unified IndexedDB implementation using the Dexie.js library, which provides:

#### Data Models:
- **PhraseEntry**: Stores emergency/useful phrases in English and Nepali with pronunciation
- **NewsCacheItem**: Cached news articles with emergency flags
- **TranslationCacheEntry**: Offline translation key-value pairs
- **MapTileCache**: Binary map tile data (PNG/WebP) with coordinates and zoom levels
- **SecureLocationEntry**: User-pinned locations (home base, emergency points, etc.)

#### Key Features:
- **Automatic Cleanup**: When map tiles exceed 5000 entries, oldest 1000 tiles are removed
- **Timestamp Tracking**: All entries include `cachedAt` for freshness validation
- **Efficient Queries**: Indexed fields for fast lookups (category, language pairs, coordinates)
- **Sync Integration**: Methods to sync data from Supabase when online returns
- **Blob Storage**: Efficient storage of binary map tile data

#### Storage Limits & Optimization:
- Map tile LRU cache with automatic cleanup (>5000 tiles triggers cleanup)
- Compression strategy outlined in OFFLINE_MAP_STRATEGY.md (WebP conversion for 60% size reduction)
- Progressive download with priority queues for critical trekking regions

### 2. Offline Service Layer

Located in: `src/lib/offlineService.ts`

Handles application-level offline data management:

#### Trip Data Caching:
- Stores weather information (6-hour TTL)
- Home base coordinates (with privacy protection - stripped before storage)
- Emergency phrases (permanent storage - Infinity TTL)
- Digital ID information (permanent storage)

#### Location Services:
- Secure location caching with user consent
- Pinned location management (save, retrieve, delete home base)
- Integration with offline database for persistent location storage

#### Emergency Systems:
- Pre-loaded Nepali emergency phrases with phonetic pronunciation
- GPS-to-SMS emergency capabilities (via intent links)
- District-specific emergency contacts (police, ambulance, fire, hospitals)
- Altitude sickness reference guides (HACE, HAPE, AMS)

#### Data Freshness:
- TTL constants for different data types (weather: 6h, maps: 7d, emergency phrases: permanent)
- Staleness detection mechanisms
- Automatic cleanup of expired data

### 3. Offline Map Implementation

Located in: `src/components/TrekkingMap.tsx`

Uses Leaflet with the leaflet.offline plugin for map tile caching:

#### Technical Approach:
- **Custom Tile Layer**: Extends Leaflet's TileLayer with offline capabilities
- **localForage Integration**: Uses localForage as storage backend for map tiles
- **Tile Interception**: Overrides `saveTileOnline` method to capture and store tiles
- **Canvas Conversion**: Converts image tiles to canvas then to Blob for storage
- **Zoom Level Control**: Caches tiles for zoom levels 12-15 (optimal for trekking detail)

#### Workflow:
1. User initiates map download via UI
2. System requests tiles from OpenStreetMap
3. Intercepted tiles are converted to Blobs and stored in localForage
4. When offline, tiles are served from localForage instead of network
5. Automatic cleanup manages storage efficiency

#### Features:
- Save/download trekking map areas for offline use
- Visual indicator of cached tile count
- Background download progress tracking
- Integration with main offline database for unified management

### 4. Offline Toolkit UI

Located in: `src/components/OfflineToolkit.tsx`

The user-facing interface for offline functionality:

#### Sections:
- **GPS Detection**: Finds user location and nearest emergency services
- **Emergency Phrases**: Critical Nepali phrases with pronunciation
- **Digital ID**: Secure storage of traveler identification
- **Home Base**: User's starting point coordinates
- **Weather**: Last known weather conditions (with staleness warnings)
- **District Emergency**: Location-specific emergency contacts
- **Altitude Sickness**: Medical reference for HACE, HAPE, AMS

#### Key Features:
- Online/offline status indicator
- Last synced timestamp display
- Privacy-conscious location processing (all client-side)
- Emergency SMS generation with GPS coordinates
- District-specific trekking information (altitude, difficulty, best seasons)
- Expandable/collapsible sections for mobile usability

### 5. Service Worker & Network Resilience

While not fully detailed in the examined files, the OFFLINE_MAP_STRATEGY.md indicates:
- Service worker for basic caching (already implemented)
- Sync strategy: Online → Sync → IndexedDB → Service Worker Cache → Offline Ready
- Smart sync that downloads more data on strong WiFi
- Selective caching allowing users to choose regions
- Delta updates for efficiency

## Data Flow & Synchronization

### Online Operations:
1. App checks network status via `navigator.onLine`
2. When online, syncs data from Supabase to local IndexedDB
3. Map tiles fetched from OpenStreetMap and cached for offline use
4. Trip data (weather, location) updated and stored locally
5. Emergency contacts and phrases refreshed from server

### Offline Operations:
1. App detects offline status and switches to local data sources
2. Map tiles served from IndexedDB/localForage cache
3. Emergency phrases, translations, and trip data retrieved from IndexedDB
4. User location still available via GPS (browser geolocation works offline)
5. New pinned locations stored locally for later sync
6. Emergency SMS generation works client-side with cached coordinates

### Sync Conflict Resolution:
- Last-write-wins strategy with timestamp-based resolution
- Map tiles use URL-based keys for natural deduplication
- Critical data (emergency phrases) uses permanent storage with versioning

## Technical Implementation Details

### Storage Technologies:
1. **IndexedDB (Dexie)**: Primary structured data storage
2. **localForage**: Binary map tile storage (fallback to IndexedDB)
3. **localStorage**: Temporary trip data caching (STORAGE_KEY)
4. **Service Workers**: Network request interception (implied from strategy doc)
5. **Browser Cache**: Standard HTTP caching for assets

### Performance Optimizations:
- **Map Tile Compression**: WebP conversion target (60% size reduction)
- **Selective Pre-caching**: Priority for trekking regions (Annapurna, Everest, Langtang)
- **LRU Eviction**: Automatic cleanup of least recently used tiles
- **Batch Operations**: Bulk inserts/deletes for efficiency
- **Timestamp-Based Freshness**: Avoids unnecessary refetches

### Security & Privacy:
- **Local-First Processing**: GPS data processed client-side, never transmitted
- **Data Minimization**: Only essential data stored offline
- **Consent-Based Location**: Explicit user permission required for location caching
- **Sensitive Data Handling**: Digital ID stripped before localStorage storage
- **No Server Transmission**: Offline data never leaves device unless explicitly shared

## Integration Points

### With Supabase/BACKEND:
- Sync service pulls latest phrases, news, and translations
- Backend serves as source of truth when online
- Conflict resolution favors server data with merge strategies for user-generated content

### With Emergency Systems:
- Integrates with district-specific emergency contact database
- GPS coordinates feed into emergency SMS generation
- Altitude data combines with sickness risk assessments
- Hospital/police/fire contacts sourced from Nepal-specific database

### With AI Features (Planned):
- Offline LLM for Nepal-specific Q&A (mentioned in strategy)
- Trail condition prediction models
- Pace calculators based on altitude and fitness
- Weather prediction from barometric pressure

## Current Limitations & Planned Enhancements

### Current State (Based on Code Examination):
- Basic phrase and news caching functional
- Map tile caching implemented via Leaflet.offline
- Emergency services and phrases available
- Location pinning and home base setting functional
- Weather caching with staleness detection
- Digital ID storage (though stripped before localStorage per privacy)

### Planned Enhancements (From OFFLINE_MAP_STRATEGY.md):
1. **Pre-downloaded Trail Maps**: Major trekking regions auto-cached
2. **Contour Lines & Elevation Data**: Topographic map layers
3. **Shelter & Water Source Database**: Tea houses, campsites, water points
4. **Smart Sync Algorithms**: WiFi-detection for bulk downloads
5. **Delta Updates**: Only changed data transferred
6. **WebP Tile Compression**: 60% storage reduction
7. **Offline LLM**: DistilBERT for Nepal-specific queries
8. **AI Trail Condition Prediction**: Weather-based trail status
9. **Enhanced POI Database**: Tea house prices, permit requirements, festivals
10. **AR Trail Markers**: Offline augmented reality navigation

## Implementation Best Practices Demonstrated

### 1. Modular Design:
- Separation of concerns: database layer, service layer, UI components
- Reusable hooks and utilities
- Clear interfaces between components

### 2. Progressive Enhancement:
- Full functionality when online
- Graceful degradation to essential features offline
- Visual indicators of offline status and data freshness

### 3. Privacy-First Approach:
- Client-side location processing
- Explicit consent for location caching
- Minimal data retention
- Stripping of sensitive identifiers before storage

### 4. User Experience Focus:
- Clear offline/online indicators
- Last synced timestamps
- Intuitive emergency access
- Expandable sections for mobile screens
- Visual feedback for long-running operations (downloads)

### 5. Performance Conscious:
- Efficient indexing strategies
- Batch database operations
- Automatic cleanup routines
- Lazy loading where appropriate
- Cancelable operations

## Conclusion

GoNepal's offline architecture represents a comprehensive solution for providing critical travel and safety information in challenging connectivity environments. By combining robust client-side storage (IndexedDB/localForage), intelligent caching strategies, privacy-conscious design, and thoughtful UX, the application ensures that trekkers in Nepal's most remote regions have access to maps, emergency information, translation services, and trip planning tools even when completely disconnected from cellular networks.

The architecture is designed for extensibility, with clear separation of concerns making it straightforward to implement the planned enhancements outlined in the OFFLINE_MAP_STRATEGY.md document, including AI-powered offline assistance, enhanced trekking-specific POI databases, and improved synchronization strategies.

This offline-first approach not only provides a competitive advantage over general-purpose mapping applications but also addresses the specific safety and navigational needs of trekkers in Nepal's diverse and often challenging terrain.