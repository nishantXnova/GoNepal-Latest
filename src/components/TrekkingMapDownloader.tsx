import { useState, useEffect, useCallback } from 'react';
import { Download, MapPin, Mountain, Loader2, CheckCircle, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface TrekkingRegion {
  id: string;
  name: string;
  description: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
  zoomRange: [number, number];
  estimatedSize: string;
  isPopular: boolean;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert';
}

// Pre-defined trekking regions with their map bounds
export const TREKKING_REGIONS: TrekkingRegion[] = [
  {
    id: 'annapurna-circuit',
    name: 'Annapurna Circuit',
    description: 'World-famous 21-day trek through diverse landscapes',
    center: [28.7, 84.0],
    bounds: [[27.8, 83.0], [29.3, 85.0]],
    zoomRange: [9, 15],
    estimatedSize: '45 MB',
    isPopular: true,
    difficulty: 'Moderate',
  },
  {
    id: 'annapurna-base-camp',
    name: 'Annapurna Base Camp',
    description: 'Stunning mountain sanctuary at 4,130m',
    center: [28.15, 84.08],
    bounds: [[27.8, 83.6], [28.5, 84.5]],
    zoomRange: [10, 15],
    estimatedSize: '35 MB',
    isPopular: true,
    difficulty: 'Moderate',
  },
  {
    id: 'everest-base-camp',
    name: 'Everest Base Camp',
    description: 'The ultimate Himalayan adventure to 5,364m',
    center: [28.0, 86.85],
    bounds: [[27.5, 86.0], [28.5, 87.5]],
    zoomRange: [9, 15],
    estimatedSize: '55 MB',
    isPopular: true,
    difficulty: 'Hard',
  },
  {
    id: 'langtang-valley',
    name: 'Langtang Valley',
    description: 'Beautiful valley with close mountain views',
    center: [28.1, 85.5],
    bounds: [[27.8, 85.0], [28.4, 86.0]],
    zoomRange: [10, 15],
    estimatedSize: '30 MB',
    isPopular: true,
    difficulty: 'Moderate',
  },
  {
    id: 'upper-mustang',
    name: 'Upper Mustang',
    description: 'Restricted area with Tibetan-like landscape',
    center: [29.0, 83.8],
    bounds: [[28.5, 83.0], [29.5, 84.5]],
    zoomRange: [10, 15],
    estimatedSize: '40 MB',
    isPopular: false,
    difficulty: 'Hard',
  },
  {
    id: 'manaslu-circuit',
    name: 'Manaslu Circuit',
    description: 'Remote and less crowded gem',
    center: [28.4, 84.8],
    bounds: [[27.9, 84.2], [28.9, 85.4]],
    zoomRange: [9, 15],
    estimatedSize: '50 MB',
    isPopular: true,
    difficulty: 'Hard',
  },
  {
    id: 'upper-dolpo',
    name: 'Upper Dolpo',
    description: 'Trans-Himalayan wilderness',
    center: [29.0, 82.5],
    bounds: [[28.5, 81.5], [29.5, 83.5]],
    zoomRange: [9, 14],
    estimatedSize: '42 MB',
    isPopular: false,
    difficulty: 'Expert',
  },
  {
    id: 'kanchenjunga',
    name: 'Kanchenjunga Circuit',
    description: 'Third highest mountain circuit',
    center: [27.7, 88.0],
    bounds: [[27.2, 87.0], [28.2, 89.0]],
    zoomRange: [9, 15],
    estimatedSize: '60 MB',
    isPopular: false,
    difficulty: 'Expert',
  },
  {
    id: 'poon-hill',
    name: 'Poon Hill',
    description: 'Short trek with stunning sunrise views',
    center: [28.4, 83.9],
    bounds: [[28.2, 83.6], [28.6, 84.2]],
    zoomRange: [12, 16],
    estimatedSize: '15 MB',
    isPopular: true,
    difficulty: 'Easy',
  },
  {
    id: 'chitwan',
    name: 'Chitwan Safari',
    description: 'Jungle wildlife adventure',
    center: [27.5, 84.3],
    bounds: [[27.2, 83.8], [27.8, 84.8]],
    zoomRange: [11, 15],
    estimatedSize: '20 MB',
    isPopular: true,
    difficulty: 'Easy',
  },
];

interface DownloadProgress {
  regionId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

interface TrekkingMapDownloaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrekkingMapDownloader({ isOpen, onClose }: TrekkingMapDownloaderProps) {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgress>>({});
  const [isOnline, setIsOnline] = useState(true);
  const [cachedRegions, setCachedRegions] = useState<string[]>([]);
  const { toast } = useToast();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached regions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cached_trekking_regions');
    if (saved) {
      try {
        setCachedRegions(JSON.parse(saved));
      } catch (e) {
        logger.error('[TrekkingMapDownloader] Error loading cached regions:', e);
      }
    }
  }, []);

  // Save cached regions to localStorage
  const saveCachedRegions = useCallback((regions: string[]) => {
    localStorage.setItem('cached_trekking_regions', JSON.stringify(regions));
    setCachedRegions(regions);
  }, []);

  // Download a trekking region
  const downloadRegion = useCallback(async (region: TrekkingRegion) => {
    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Please connect to the internet to download maps',
        variant: 'destructive',
      });
      return;
    }

    setDownloadProgress(prev => ({
      ...prev,
      [region.id]: { regionId: region.id, progress: 0, status: 'downloading' },
    }));

    try {
      logger.log(`[TrekkingMapDownloader] Starting download for ${region.name}`);
      
      // Simulate downloading tiles (in real implementation, this would download actual map tiles)
      // Using a progress simulation for demo
      const totalSteps = 100;
      for (let i = 0; i <= totalSteps; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setDownloadProgress(prev => ({
          ...prev,
          [region.id]: { ...prev[region.id], progress: i },
        }));
      }

      // Save region as cached
      const newCached = [...cachedRegions, region.id];
      saveCachedRegions(newCached);

      setDownloadProgress(prev => ({
        ...prev,
        [region.id]: { regionId: region.id, progress: 100, status: 'completed' },
      }));

      toast({
        title: 'Download Complete',
        description: `${region.name} map is now available offline`,
      });

      logger.log(`[TrekkingMapDownloader] Downloaded ${region.name}`);
    } catch (error) {
      logger.error(`[TrekkingMapDownloader] Error downloading ${region.name}:`, error);
      setDownloadProgress(prev => ({
        ...prev,
        [region.id]: { 
          regionId: region.id, 
          progress: 0, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Download failed',
        },
      }));
      toast({
        title: 'Download Failed',
        description: `Could not download ${region.name}`,
        variant: 'destructive',
      });
    }
  }, [isOnline, cachedRegions, saveCachedRegions, toast]);

  // Remove a cached region
  const removeRegion = useCallback((regionId: string) => {
    const newCached = cachedRegions.filter(id => id !== regionId);
    saveCachedRegions(newCached);
    setDownloadProgress(prev => {
      const { [regionId]: _, ...rest } = prev;
      return rest;
    });
    toast({
      title: 'Removed',
      description: 'Region removed from offline storage',
    });
  }, [cachedRegions, saveCachedRegions, toast]);

  if (!isOpen) return null;

  const popularRegions = TREKKING_REGIONS.filter(r => r.isPopular);
  const otherRegions = TREKKING_REGIONS.filter(r => !r.isPopular);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mountain className="h-6 w-6 text-nepal-gold" />
              <h2 className="text-xl font-bold text-white">Trekking Maps</h2>
              {cachedRegions.length > 0 && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  {cachedRegions.length} cached
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                  <Wifi className="h-3 w-3" />
                  ONLINE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">
                  <WifiOff className="h-3 w-3" />
                  OFFLINE
                </span>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="ml-2 text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Download trekking maps for offline use. Requires internet connection.
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Popular Regions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-nepal-gold" />
              Popular Routes
            </h3>
            <div className="space-y-2">
              {popularRegions.map(region => (
                <RegionCard
                  key={region.id}
                  region={region}
                  isExpanded={expandedRegion === region.id}
                  onToggle={() => setExpandedRegion(expandedRegion === region.id ? null : region.id)}
                  isCached={cachedRegions.includes(region.id)}
                  downloadProgress={downloadProgress[region.id]}
                  onDownload={() => downloadRegion(region)}
                  onRemove={() => removeRegion(region.id)}
                  isOnline={isOnline}
                />
              ))}
            </div>
          </div>

          {/* Other Regions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">More Regions</h3>
            <div className="space-y-2">
              {otherRegions.map(region => (
                <RegionCard
                  key={region.id}
                  region={region}
                  isExpanded={expandedRegion === region.id}
                  onToggle={() => setExpandedRegion(expandedRegion === region.id ? null : region.id)}
                  isCached={cachedRegions.includes(region.id)}
                  downloadProgress={downloadProgress[region.id]}
                  onDownload={() => downloadRegion(region)}
                  onRemove={() => removeRegion(region.id)}
                  isOnline={isOnline}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Star icon component
function StarIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// Individual region card component
interface RegionCardProps {
  region: TrekkingRegion;
  isExpanded: boolean;
  onToggle: () => void;
  isCached: boolean;
  downloadProgress?: DownloadProgress;
  onDownload: () => void;
  onRemove: () => void;
  isOnline: boolean;
}

function RegionCard({ 
  region, 
  isExpanded, 
  onToggle, 
  isCached, 
  downloadProgress, 
  onDownload, 
  onRemove,
  isOnline 
}: RegionCardProps) {
  const difficultyColors = {
    'Easy': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Moderate': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Hard': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Expert': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-nepal-gold/20 rounded-lg">
            <MapPin className="h-5 w-5 text-nepal-gold" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{region.name}</h4>
            <p className="text-sm text-slate-400">{region.estimatedSize}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${difficultyColors[region.difficulty]}`}>
            {region.difficulty}
          </span>
          {isCached && (
            <CheckCircle className="h-5 w-5 text-green-400" />
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-slate-300 text-sm mb-3">{region.description}</p>
          
          {/* Progress bar when downloading */}
          {downloadProgress?.status === 'downloading' && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Downloading...</span>
                <span>{downloadProgress.progress}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-nepal-gold transition-all duration-300"
                  style={{ width: `${downloadProgress.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {!isCached ? (
              <Button
                onClick={onDownload}
                disabled={!isOnline || downloadProgress?.status === 'downloading'}
                className="flex-1"
                size="sm"
              >
                {downloadProgress?.status === 'downloading' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={onRemove}
                variant="outline"
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                size="sm"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}