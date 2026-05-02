import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getCachedTrip } from '@/lib/offlineService';
import { createMapTransformHandler } from '@/lib/offlineMapService';
import { X } from 'lucide-react';

interface OfflineMapViewerProps {
  regionId?: number;
  bounds?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  onClose?: () => void;
}

/**
 * OfflineMapViewer: Displays an offline map using MapLibre GL JS.
 * Uses cached OSM tiles from IndexedDB. If tiles aren't cached, they'll try to fetch (needs online).
 */
export default function OfflineMapViewer({ regionId, bounds, onClose }: OfflineMapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const transformHandlerRef = useRef<ReturnType<typeof createMapTransformHandler> | null>(null);

  // Determine map bounds
  const mapBounds = bounds ? [[bounds[0], bounds[1]], [bounds[2], bounds[3]]] as [[number, number], [number, number]] : undefined;

  useEffect(() => {
    if (!containerRef.current) return;

    // Create transform handler once
    transformHandlerRef.current = createMapTransformHandler();

    // Initialize MapLibre map
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: mapBounds ? [(bounds![0] + bounds![2]) / 2, (bounds![1] + bounds![3]) / 2] : [0, 0],
      zoom: mapBounds ? 10 : 1,
      hash: true,
      transformRequest: (url: string, resourceType: string) => {
        // Use the transform handler to serve cached tiles
        if (transformHandlerRef.current) {
          const result = transformHandlerRef.current(url, resourceType);
          if (result) return result;
        }
        // Let MapLibre handle normally (will fetch from network or cache)
        return { url };
      },
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Fit bounds if provided
    if (mapBounds) {
      map.fitBounds(mapBounds, { padding: 50, maxZoom: 16 });
    }

    // Add home location marker if trip is cached
    const trip = getCachedTrip();
    if (trip?.homeCoords) {
      const el = document.createElement('div');
      el.className = 'w-8 h-8 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold';
      el.textContent = 'Home';
      new maplibregl.Marker({ element: el })
        .setLngLat([trip.homeCoords.lng, trip.homeCoords.lat])
        .addTo(map);
    }

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Offline Map</h3>
            <p className="text-xs text-gray-500">Viewing downloaded area</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div ref={containerRef} className="flex-1 relative">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p>Loading map...</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-50 text-xs text-gray-500 text-center border-t">
          Tiles are served from your local storage. Works offline.
        </div>
      </div>
    </div>
  );
}
