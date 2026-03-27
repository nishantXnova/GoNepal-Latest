import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.offline';
import localforage from 'localforage';
import { Button } from '@/components/ui/button';
import { Download, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { cacheMapTile, getCachedTileCount } from '@/lib/offlineDatabase';

// Fix for default marker icon in Leaflet + Webpack/Vite
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ============================================================================
// Types
// ============================================================================

interface TrekkingMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  showDownloadButton?: boolean;
  onAreaDownloaded?: (tileCount: number) => void;
}

interface Location {
  name: string;
  lat: number;
  lng: number;
  description?: string;
}

// Nepal trekking locations
const TREKKING_LOCATIONS: Location[] = [
  { name: 'Kathmandu', lat: 27.7172, lng: 85.324, description: 'Capital City' },
  { name: 'Everest Base Camp', lat: 28.0045, lng: 86.8556, description: 'Everest Trek' },
  { name: 'Namche Bazaar', lat: 27.8068, lng: 86.7139, description: 'Sherpa Capital' },
  { name: 'Lukla', lat: 27.6878, lng: 86.7314, description: 'Gateway to Everest' },
  { name: 'Pokhara', lat: 28.2096, lng: 83.9856, description: 'Lake City' },
  { name: 'Annapurna Base Camp', lat: 28.1652, lng: 84.0822, description: 'Annapurna Trek' },
  { name: 'Jomsom', lat: 28.7798, lng: 83.9189, description: 'MUSTANG route' },
  { name: 'Langtang', lat: 28.2094, lng: 85.5417, description: 'Langtang Trek' },
  { name: 'Manaslu Base Camp', lat: 28.6319, lng: 84.7386, description: 'Manaslu Circuit' },
  { name: 'Tilicho Lake', lat: 28.5081, lng: 84.1319, description: 'High altitude lake' },
];

// Configure localforage for tile storage
localforage.config({
  name: 'GonepalOffline',
  storeName: 'map_tiles',
  description: 'Offline map tiles for trekking'
});

// ============================================================================
// Map Controller Component
// ============================================================================

const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// ============================================================================
// Download Control Component
// ============================================================================

const SaveTilesControl = ({ 
  map, 
  onDownloadStart, 
  onDownloadComplete 
}: { 
  map: L.Map | null; 
  onDownloadStart: () => void;
  onDownloadComplete: (count: number) => void;
}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleDownload = useCallback(async () => {
    if (!map) {
      toast({
        title: 'Error',
        description: 'Map not initialized',
        variant: 'destructive'
      });
      return;
    }

    setDownloading(true);
    onDownloadStart();

    try {
      // @ts-ignore - leaflet.offline adds this method
      const layer = map._tilesOfflineLayer;
      
      if (!layer) {
        logger.warn('[TrekkingMap] Offline layer not found');
        toast({
          title: 'Download Failed',
          description: 'Map offline layer not available',
          variant: 'destructive'
        });
        setDownloading(false);
        return;
      }

      toast({
        title: 'Downloading Map Area',
        description: 'This may take a few minutes...',
      });

      // Save tiles for zoom levels 12-15
      // @ts-ignore
      layer.saveTiles(async (savedCount: number) => {
        logger.log(`[TrekkingMap] Downloaded ${savedCount} tiles`);
        setProgress(savedCount);
      });

      // The download happens asynchronously
      // We track completion via the callback
      setTimeout(() => {
        setDownloading(false);
        getCachedTileCount().then(count => {
          onDownloadComplete(count);
          toast({
            title: 'Download Complete',
            description: `Saved ${count} map tiles for offline use`,
          });
        });
      }, 5000);

    } catch (error) {
      logger.error('[TrekkingMap] Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download map tiles',
        variant: 'destructive'
      });
      setDownloading(false);
    }
  }, [map, onDownloadStart, onDownloadComplete, toast]);

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading}
      className="bg-green-600 hover:bg-green-700 text-white"
      size="sm"
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Downloading {progress}...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Save Trekking Map
        </>
      )}
    </Button>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function TrekkingMap({
  center = [27.7172, 85.324], // Kathmandu default
  zoom = 10,
  height = '400px',
  showDownloadButton = true,
  onAreaDownloaded
}: TrekkingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [location, setLocation] = useState<[number, number]>(center);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cachedTileCount, setCachedTileCount] = useState(0);
  const { toast } = useToast();

  // Check cached tile count on mount
  useEffect(() => {
    getCachedTileCount().then(count => {
      setCachedTileCount(count);
      if (count > 0) {
        logger.log(`[TrekkingMap] Found ${count} cached tiles`);
      }
    });
  }, []);

  const handleMapLoad = useCallback((map: L.Map) => {
    mapRef.current = map;
    
    // Setup offline tile storage using localforage
    // @ts-ignore - leaflet.offline plugin
    const offlineLayer = L.tileLayer.offline('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      minZoom: 8,
      maxZoom: 17,
      subdomains: 'abc',
      // Use localforage as storage backend
      saveTileOnline: async (tile: HTMLImageElement, bounds: L.LatLngBounds, zoom: number, x: number, y: number) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          const src = tile.src;
          
          return new Promise<L.Canvas>((resolve, reject) => {
            img.onload = async () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
              
              canvas.toBlob(async (blob) => {
                if (blob) {
                  const key = `${zoom}_${x}_${y}`;
                  await localforage.setItem(key, blob);
                  logger.log(`[TrekkingMap] Saved tile ${key}`);
                }
                resolve(canvas);
              }, 'image/png');
            };
            img.onerror = reject;
            img.src = src;
          });
        } catch (error) {
          logger.error('[TrekkingMap] Error saving tile:', error);
          return Promise.reject(error);
        }
      }
    });
    
    // @ts-ignore
    map._tilesOfflineLayer = offlineLayer;
    
    // Add the layer
    // @ts-ignore
    offlineLayer.addTo(map);
    
    logger.log('[TrekkingMap] Offline layer initialized');
  }, []);

  const handleDownloadStart = useCallback(() => {
    setIsDownloading(true);
  }, []);

  const handleDownloadComplete = useCallback((count: number) => {
    setIsDownloading(false);
    setCachedTileCount(count);
    if (onAreaDownloaded) {
      onAreaDownloaded(count);
    }
  }, [onAreaDownloaded]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      {/* Map */}
      <MapContainer
        center={location}
        zoom={zoom}
        style={{ height, width: '100%' }}
        className="z-0"
        whenReady={({ target }) => handleMapLoad(target)}
      >
        <ChangeView center={location} zoom={zoom} />
        
        {/* Offline-capable tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains="abc"
        />
        
        {/* Trekking Location Markers */}
        {TREKKING_LOCATIONS.map((loc) => (
          <Marker
            key={loc.name}
            position={[loc.lat, loc.lng]}
            eventHandlers={{
              click: () => {
                setLocation([loc.lat, loc.lng]);
              },
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                {loc.description && (
                  <p className="text-sm text-gray-500">{loc.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Approximate radius circles for key locations */}
        <Circle
          center={[28.0045, 86.8556]}
          radius={5000}
          pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.1 }}
        />
        <Circle
          center={[28.1652, 84.0822]}
          radius={5000}
          pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.1 }}
        />
      </MapContainer>

      {/* Download Button */}
      {showDownloadButton && (
        <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-2">
          {cachedTileCount > 0 && (
            <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-md text-xs text-gray-600 shadow">
              <MapPin className="w-3 h-3 inline mr-1" />
              {cachedTileCount} tiles cached
            </div>
          )}
          <SaveTilesControl
            map={mapRef.current}
            onDownloadStart={handleDownloadStart}
            onDownloadComplete={handleDownloadComplete}
          />
        </div>
      )}

      {/* Location List */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Navigation className="w-4 h-4 mr-2" />
          Popular Trekking Destinations
        </h4>
        <div className="flex flex-wrap gap-2">
          {TREKKING_LOCATIONS.slice(0, 6).map((loc) => (
            <button
              key={loc.name}
              onClick={() => setLocation([loc.lat, loc.lng])}
              className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export for use in other components
export { TREKKING_LOCATIONS };
