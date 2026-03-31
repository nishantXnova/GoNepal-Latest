import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Users, DollarSign, Filter, Loader2, Sparkles, X, Hotel, Download, Share2, Mountain, Landmark, TreePine, Heart, Compass, MapPin, Navigation, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { getSafeErrorMessage } from "@/utils/errorUtils";
import { parseMarkdown, cleanLatexText } from "@/lib/markdownParser";

export interface OSMSearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
}

// OSM Search function using Nominatim
const searchPlacesOSM = async (query: string): Promise<OSMSearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=np`,
      {
        headers: {
          'User-Agent': 'GonePal/1.0',
        },
      }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.slice(0, 5);
  } catch (error) {
    logger.error('OSM search error:', error);
    return [];
  }
};

const interests = ["Adventure", "Culture", "Nature", "Spirituality", "Family"];
const durations = ["3 days", "5 days", "7 days", "10+ days"];
const difficulties = ["Easy", "Moderate", "Challenging"];
const budgets = ["Budget", "Mid-range", "Luxury"];

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Kathmandu": { lat: 27.7172, lng: 85.3240 },
  "Pokhara": { lat: 28.2096, lng: 83.9856 },
  "Lumbini": { lat: 27.4784, lng: 83.2750 },
  "Chitwan": { lat: 27.5333, lng: 84.4500 },
  "Lukla": { lat: 27.6833, lng: 86.7333 },
  "Namche": { lat: 27.8000, lng: 86.7167 },
};

const renderItineraryWithLinks = (text: string) => {
  return (
    <div className="space-y-4">
      {text.split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={idx} />;

        const isAccommodation = trimmed.toLowerCase().includes('accommodation') ||
          trimmed.toLowerCase().includes('stay at') ||
          trimmed.toLowerCase().includes('hotels');

        if (isAccommodation) {
          const city = Object.keys(CITY_COORDS).find(c => trimmed.includes(c));
          const coords = city ? CITY_COORDS[city] : CITY_COORDS["Kathmandu"];

          return (
            <div key={idx} className="mb-4">
              {parseMarkdown(line)}
              <div className="mt-2">
                <a
                  href="/#nearby-places"
                  className="inline-flex items-center text-[13px] font-bold text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100"
                >
                  <Hotel className="w-3.5 h-3.5 mr-1.5" />
                  Find real hotels here →
                </a>
              </div>
            </div>
          );
        }
        return <div key={idx}>{parseMarkdown(line)}</div>;
      })}
    </div>
  );
};

const PlanTrip = () => {
  const { toast } = useToast();
  const [destinationQuery, setDestinationQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OSMSearchResult[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<OSMSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<string | null>(null);

  // Custom Exploration Feature
  const [showCustomExplore, setShowCustomExplore] = useState(false);
  const [customExploreQuery, setCustomExploreQuery] = useState('');
  const [isSearchingExplore, setIsSearchingExplore] = useState(false);
  const [customSearchResults, setCustomSearchResults] = useState<OSMSearchResult[]>([]);
  const [selectedCustomPlace, setSelectedCustomPlace] = useState<OSMSearchResult | null>(null);
  const [showCustomResults, setShowCustomResults] = useState(false);
  const customSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (destinationQuery.length >= 2 && !selectedDestination) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchPlacesOSM(destinationQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowResults(true);
      }, 300);
    } else {
      setSearchResults([]);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [destinationQuery, selectedDestination]);

  const handleSelectDestination = (result: OSMSearchResult) => {
    setSelectedDestination(result);
    setDestinationQuery(result.display_name.split(',')[0]);
    setShowResults(false);
    setSearchResults([]);
  };

  const handleClearDestination = () => {
    setSelectedDestination(null);
    setDestinationQuery('');
    setSearchResults([]);
  };

  // Custom Exploration Search with debounce
  useEffect(() => {
    if (customSearchTimeoutRef.current) {
      clearTimeout(customSearchTimeoutRef.current);
    }
    
    if (customExploreQuery.length >= 2) {
      setIsSearchingExplore(true);
      customSearchTimeoutRef.current = setTimeout(async () => {
        const results = await searchPlacesOSM(customExploreQuery);
        setCustomSearchResults(results);
        setIsSearchingExplore(false);
        setShowCustomResults(true);
      }, 300);
    } else {
      setCustomSearchResults([]);
    }
    
    return () => {
      if (customSearchTimeoutRef.current) {
        clearTimeout(customSearchTimeoutRef.current);
      }
    };
  }, [customExploreQuery]);

  const handleSelectCustomPlace = (result: OSMSearchResult) => {
    setSelectedCustomPlace(result);
    setCustomExploreQuery(result.display_name.split(',')[0]);
    setShowCustomResults(false);
    setCustomSearchResults([]);
  };

  const handleClearCustomPlace = () => {
    setSelectedCustomPlace(null);
    setCustomExploreQuery('');
    setCustomSearchResults([]);
  };

  const openCustomExplore = () => {
    setShowCustomExplore(true);
  };

  const closeCustomExplore = () => {
    setShowCustomExplore(false);
    setCustomExploreQuery('');
    setCustomSearchResults([]);
    setSelectedCustomPlace(null);
  };

  const handleGenerateItinerary = async () => {
    if (!selectedInterest || !selectedDuration) {
      toast({
        variant: "destructive",
        title: "Please select your interests and trip duration",
      });
      return;
    }

    setIsLoading(true);
    try {
      const requestBody: any = {
        interest: selectedInterest,
        duration: selectedDuration,
        difficulty: selectedDifficulty || 'Moderate',
        budget: selectedBudget || 'Mid-range',
      };
      
      // Add destination info if selected
      if (selectedDestination) {
        requestBody.destination = {
          name: selectedDestination.display_name.split(',')[0],
          fullAddress: selectedDestination.display_name,
          lat: selectedDestination.lat,
          lng: selectedDestination.lon,
          type: selectedDestination.type,
        };
      }

      const { data, error } = await supabase.functions.invoke('ai-trip-planner', {
        body: requestBody
      });

      if (error) throw error;

      if (data.success) {
        // Clean the LaTeX characters before setting
        const cleanedItinerary = cleanLatexText(data.itinerary);
        setItinerary(cleanedItinerary);
      } else {
        throw new Error(data.error || 'Failed to generate itinerary');
      }
    } catch (error: any) {
      logger.error('Trip planner error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: getSafeErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetItinerary = () => {
    setItinerary(null);
  };

  // Interface for custom search places
  interface CustomPlace {
    id: number;
    lat: number;
    lon: number;
    name: string;
    type: string;
    category: string;
  }

  // Fetch nearby places using Overpass API (from NearbyPlaces)
  const fetchNearbyPlacesForExplore = async (lat: number, lon: number): Promise<CustomPlace[]> => {
    try {
      const radius = 5000; // 5km radius for exploration
      
      // Categories similar to NearbyPlaces but focused on tourist attractions
      const queries = [
        'node["tourism~""hotel|guest_house|hostel|motel|apartment""](around:' + radius + ',' + lat + ',' + lon + ')',
        'node["amenity~""restaurant|cafe|bar|fast_food""](around:' + radius + ',' + lat + ',' + lon + ')',
        'node["leisure~""park|garden|swimming_pool|fitness_centre""](around:' + radius + ',' + lat + ',' + lon + ')',
        'node["shop~""mall|supermarket|souvenir|clothing""](around:' + radius + ',' + lat + ',' + lon + ')',
        'node["historic~""monument|memorial|archaeological_site|ruins""](around:' + radius + ',' + lat + ',' + lon + ')',
        'node["tourism~""attraction|viewpoint|museum|gallery|theme_park""](around:' + radius + ',' + lat + ',' + lon + ')',
        'way["tourism~""hotel|guest_house|hostel""](around:' + radius + ',' + lat + ',' + lon + ')',
        'way["amenity~""restaurant|cafe|bar""](around:' + radius + ',' + lat + ',' + lon + ')',
        'way["leisure~""park|garden""](around:' + radius + ',' + lat + ',' + lon + ')',
        'way["historic~""monument|memorial|archaeological_site""](around:' + radius + ',' + lat + ',' + lon + ')',
        'way["tourism~""attraction|viewpoint|museum""](around:' + radius + ',' + lat + ',' + lon + ')',
      ].join(';');

      const overpassQuery = `
        [out:json];
        (
          ${queries}
        );
        out center body;
      `;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
      });

      if (!response.ok) throw new Error("Failed to fetch places");

      const data = await response.json();
      const formattedPlaces: CustomPlace[] = data.elements
        .filter((el: any) => (el.lat && el.lon) || (el.center && el.center.lat && el.center.lon))
        .map((el: any) => {
          const placeLat = el.lat || el.center?.lat;
          const placeLon = el.lon || el.center?.lon;
          
          let category = "other";
          const tags = el.tags || {};
          
          if (tags.tourism) category = tags.tourism;
          else if (tags.amenity) category = tags.amenity;
          else if (tags.leisure) category = tags.leisure;
          else if (tags.shop) category = tags.shop;
          else if (tags.historic) category = tags.historic;

          return {
            id: el.id,
            lat: placeLat,
            lon: placeLon,
            name: tags.name || tags.operator || "Unnamed Place",
            type: category,
            category: category,
          };
        });

      // Remove duplicates by name and limit to 20 places
      const uniquePlaces = formattedPlaces
        .filter((place, index, self) => 
          index === self.findIndex((p) => p.name === place.name)
        )
        .slice(0, 20);

      return uniquePlaces;
    } catch (err) {
      logger.error('Error fetching places for exploration:', err);
      return [];
    }
  };

  const handleGenerateCustomItinerary = async () => {
    if (!selectedCustomPlace) {
      toast({
        variant: "destructive",
        title: "Please select a place to explore",
      });
      return;
    }

    if (!selectedInterest || !selectedDuration) {
      toast({
        variant: "destructive",
        title: "Please select your interests and trip duration",
      });
      return;
    }

    setIsLoading(true);
    closeCustomExplore();
    
    try {
      // Fetch nearby places using the Overpass API
      const lat = parseFloat(selectedCustomPlace.lat);
      const lon = parseFloat(selectedCustomPlace.lon);
      
      const nearbyPlaces = await fetchNearbyPlacesForExplore(lat, lon);
      
      // Group places by category for better AI understanding
      const placesByCategory = {
        hotels: nearbyPlaces.filter(p => ['hotel', 'guest_house', 'hostel', 'motel', 'apartment'].includes(p.category)).map(p => p.name),
        restaurants: nearbyPlaces.filter(p => ['restaurant', 'cafe', 'bar', 'fast_food'].includes(p.category)).map(p => p.name),
        attractions: nearbyPlaces.filter(p => ['attraction', 'viewpoint', 'museum', 'gallery', 'theme_park'].includes(p.category)).map(p => p.name),
        parks: nearbyPlaces.filter(p => ['park', 'garden', 'swimming_pool', 'fitness_centre'].includes(p.category)).map(p => p.name),
        shops: nearbyPlaces.filter(p => ['mall', 'supermarket', 'souvenir', 'clothing'].includes(p.category)).map(p => p.name),
        historic: nearbyPlaces.filter(p => ['monument', 'memorial', 'archaeological_site', 'ruins'].includes(p.category)).map(p => p.name),
      };
      
      // Filter out "Unnamed Place" and empty names
      Object.keys(placesByCategory).forEach(key => {
        placesByCategory[key as keyof typeof placesByCategory] = placesByCategory[key as keyof typeof placesByCategory].filter(name => name && name !== 'Unnamed Place');
      });
      
      // Create a comprehensive prompt for the AI
      const locationName = selectedCustomPlace.display_name.split(',')[0];
      const fullAddress = selectedCustomPlace.display_name;
      
      // Build a very explicit instruction for the AI
      let locationPrompt = `CRITICAL INSTRUCTION: Plan a trip specifically around "${locationName}" (${fullAddress}). `;
      locationPrompt += `Coordinates: Latitude ${lat}, Longitude ${lon}. `;
      
      // Add available places if found
      if (placesByCategory.hotels.length > 0) {
        locationPrompt += `Hotels/lodging near ${locationName}: ${placesByCategory.hotels.join(', ')}. `;
      }
      if (placesByCategory.restaurants.length > 0) {
        locationPrompt += `Restaurants/cafes near ${locationName}: ${placesByCategory.restaurants.join(', ')}. `;
      }
      if (placesByCategory.attractions.length > 0) {
        locationPrompt += `Tourist attractions near ${locationName}: ${placesByCategory.attractions.join(', ')}. `;
      }
      if (placesByCategory.historic.length > 0) {
        locationPrompt += `Historic sites near ${locationName}: ${placesByCategory.historic.join(', ')}. `;
      }
      if (placesByCategory.parks.length > 0) {
        locationPrompt += `Parks/nature areas near ${locationName}: ${placesByCategory.parks.join(', ')}. `;
      }
      if (placesByCategory.shops.length > 0) {
        locationPrompt += `Shops/markets near ${locationName}: ${placesByCategory.shops.join(', ')}. `;
      }
      
      locationPrompt += `MANDATORY: Your entire itinerary must revolve around ${locationName}. Every day should include activities, visits, or accommodations within ${locationName} or very close to it. Do NOT suggest places in Kathmandu, Pokhara, or other distant cities unless they are part of travel to/from ${locationName}. Use ONLY the real place names provided above.`;
      
      const requestBody: any = {
        interest: selectedInterest,
        duration: selectedDuration,
        difficulty: selectedDifficulty || 'Moderate',
        budget: selectedBudget || 'Mid-range',
        // Include the actual places found for the AI to use
        nearbyLocations: {
          locationName: locationName,
          fullAddress: fullAddress,
          coordinates: { lat: lat, lng: lon },
          hotels: placesByCategory.hotels.slice(0, 5),
          restaurants: placesByCategory.restaurants.slice(0, 8),
          attractions: placesByCategory.attractions.slice(0, 5),
          parks: placesByCategory.parks.slice(0, 5),
          shops: placesByCategory.shops.slice(0, 5),
          historicSites: placesByCategory.historic.slice(0, 5),
        },
        // Strong system instruction for the AI
        systemInstruction: locationPrompt,
        // Force location-specific planning
        forceLocationBased: true,
        primaryDestination: locationName,
      };

      const { data, error } = await supabase.functions.invoke('ai-trip-planner', {
        body: requestBody
      });

      if (error) throw error;

      if (data.success) {
        const cleanedItinerary = cleanLatexText(data.itinerary);
        setItinerary(cleanedItinerary);
      } else {
        throw new Error(data.error || 'Failed to generate itinerary');
      }
    } catch (error: any) {
      logger.error('Custom trip planner error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: getSafeErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="plan" className="section-padding bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container-wide relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-primary-foreground/70 uppercase tracking-widest text-sm font-medium mb-4">
            AI Trip Planner
          </p>
          <h2 className="heading-section text-primary-foreground mb-4">
            Plan Your Perfect <span className="italic text-nepal-gold">Journey</span>
          </h2>
          <p className="text-body-large text-primary-foreground/80 max-w-2xl mx-auto">
            Tell us how you want to explore, and our AI will create a personalized itinerary just for you.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {itinerary ? (
            // Itinerary Result
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-3xl p-8 md:p-12 shadow-elevated max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  <h3 className="font-display text-xl font-semibold text-foreground">Your Custom Itinerary</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={resetItinerary}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <div className="text-sm leading-relaxed">
                  {itinerary ? renderItineraryWithLinks(itinerary) : null}
                </div>
              </div>

              {itinerary && (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="default"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-6"
                    onClick={() => {
                        const blob = new Blob([itinerary], { type: 'text/markdown;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `GoNepal-Trip-Plan-${new Date().toISOString().split('T')[0]}.md`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        toast({
                          title: "Downloaded Successfully",
                          description: "Your plan has been saved as a Markdown file.",
                        });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 rounded-xl py-6 relative"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                         const { data, error } = await supabase
                           .from('shared_itineraries' as any)
                           .insert([{ itinerary_text: itinerary }])
                           .select('id')
                           .single();
                           
                         if (error) throw error;
                         
                         const shareUrl = `${window.location.origin}/itinerary/${data.id}`;
                         await navigator.clipboard.writeText(shareUrl);
                         
                         toast({
                           title: "Link Copied!",
                           description: "A unique public shareable link has been copied to your clipboard.",
                         });
                      } catch (err: any) {
                        toast({
                          variant: "destructive",
                          title: "Sharing Failed",
                          description: err.message || "Could not generate share link.",
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                    Share Link
                  </Button>
                </div>
              )}
              <div className="mt-8 pt-6 border-t border-border">
                <Button onClick={resetItinerary} variant="outline" className="w-full">
                  Plan Another Trip
                </Button>
              </div>
            </motion.div>
          ) : (
            // Filter Card
            <motion.div
              key="filters"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-card rounded-3xl p-8 md:p-12 shadow-elevated max-w-4xl mx-auto"
            >
              {/* Destination Search - NEW FEATURE */}
              <motion.div
                ref={searchRef}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0 }}
                className="mb-8"
              >
                <label className="flex items-center gap-2 text-foreground font-medium mb-4">
                  <Navigation className="h-5 w-5 text-accent" />
                  Where do you want to go? (Optional)
                </label>
                <div className="relative">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={destinationQuery}
                      onChange={(e) => {
                        setDestinationQuery(e.target.value);
                        setSelectedDestination(null);
                      }}
                      onFocus={() => searchResults.length > 0 && setShowResults(true)}
                      placeholder="Search for a place in Nepal..."
                      className="w-full pl-12 pr-12 py-3.5 rounded-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none transition-colors"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
                    )}
                    {selectedDestination && (
                      <button
                        onClick={handleClearDestination}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {showResults && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-background rounded-xl border-2 border-border shadow-elevated overflow-hidden"
                      >
                        {searchResults.map((result, index) => (
                          <button
                            key={result.place_id}
                            onClick={() => handleSelectDestination(result)}
                            className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors flex items-start gap-3 border-b border-border last:border-b-0"
                          >
                            <MapPin className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {result.display_name.split(',')[0]}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {result.display_name.split(',').slice(1).join(',').trim()}
                              </p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {selectedDestination && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200"
                  >
                    <Navigation className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      AI will plan your trip to: {selectedDestination.display_name.split(',')[0]}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Interest Filter */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8"
              >
                <label className="flex items-center gap-2 text-foreground font-medium mb-4">
                  <Search className="h-5 w-5 text-accent" />
                  What interests you?
                </label>
                <div className="flex flex-wrap gap-3">
                  {interests.map((interest, index) => (
                    <motion.button
                      key={interest}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedInterest(interest === selectedInterest ? null : interest)}
                      className={`px-5 py-2.5 rounded-full border-2 transition-all duration-300 ${selectedInterest === interest
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border text-foreground hover:border-accent hover:text-accent"
                        }`}
                    >
                      {interest}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Duration Filter */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
              >
                <label className="flex items-center gap-2 text-foreground font-medium mb-4">
                  <Calendar className="h-5 w-5 text-accent" />
                  How long is your trip?
                </label>
                <div className="flex flex-wrap gap-3">
                  {durations.map((duration, index) => (
                    <motion.button
                      key={duration}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDuration(duration === selectedDuration ? null : duration)}
                      className={`px-5 py-2.5 rounded-full border-2 transition-all duration-300 ${selectedDuration === duration
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border text-foreground hover:border-accent hover:text-accent"
                        }`}
                    >
                      {duration}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Difficulty & Budget */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Difficulty */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label className="flex items-center gap-2 text-foreground font-medium mb-4">
                    <Filter className="h-5 w-5 text-accent" />
                    Difficulty level?
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {difficulties.map((difficulty, index) => (
                      <motion.button
                        key={difficulty}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDifficulty(difficulty === selectedDifficulty ? null : difficulty)}
                        className={`px-5 py-2.5 rounded-full border-2 transition-all duration-300 ${selectedDifficulty === difficulty
                          ? "bg-accent text-accent-foreground border-accent"
                          : "border-border text-foreground hover:border-accent hover:text-accent"
                          }`}
                      >
                        {difficulty}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Budget */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label className="flex items-center gap-2 text-foreground font-medium mb-4">
                    <DollarSign className="h-5 w-5 text-accent" />
                    What's your budget?
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {budgets.map((budget, index) => (
                      <motion.button
                        key={budget}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedBudget(budget === selectedBudget ? null : budget)}
                        className={`px-5 py-2.5 rounded-full border-2 transition-all duration-300 ${selectedBudget === budget
                          ? "bg-accent text-accent-foreground border-accent"
                          : "border-border text-foreground hover:border-accent hover:text-accent"
                          }`}
                      >
                        {budget}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="w-full text-lg py-6 text-white font-semibold transition-colors disabled:opacity-50 disabled:bg-gray-400"
                  style={{ backgroundColor: (!selectedInterest || !selectedDuration || isLoading) ? undefined : '#FB923C' }}
                  disabled={!selectedInterest || !selectedDuration || isLoading}
                  onClick={handleGenerateItinerary}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Your Itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate AI Itinerary
                    </>
                  )}
                </Button>

                {/* Custom Exploration Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-lg py-6 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 font-semibold transition-colors"
                    onClick={openCustomExplore}
                    disabled={isLoading}
                  >
                    <Globe className="mr-2 h-5 w-5" />
                    Explore a Specific Area
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Tell us where you want to go, and we'll search real places for your plan
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Exploration Dialog */}
        <Dialog open={showCustomExplore} onOpenChange={(open) => !open && closeCustomExplore()}>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-500" />
                Explore a Specific Area
              </DialogTitle>
              <DialogDescription>
                Tell us where you want to explore. We'll search for real places nearby and create your AI plan using actual locations, restaurants, attractions, and activities found in that area.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Where do you want to explore?
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={customExploreQuery}
                    onChange={(e) => {
                      setCustomExploreQuery(e.target.value);
                      setSelectedCustomPlace(null);
                    }}
                    placeholder="e.g., Thamel, Pokhara Lakeside, Sauraha..."
                    className="pl-10 pr-10"
                  />
                  {isSearchingExplore && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                  )}
                  {selectedCustomPlace && (
                    <button
                      onClick={handleClearCustomPlace}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showCustomResults && customSearchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-background rounded-lg border-2 border-border shadow-elevated overflow-hidden max-h-60 overflow-y-auto">
                    {customSearchResults.map((result) => (
                      <button
                        key={result.place_id}
                        onClick={() => handleSelectCustomPlace(result)}
                        className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors flex items-start gap-3 border-b border-border last:border-b-0"
                      >
                        <MapPin className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {result.display_name.split(',')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.display_name.split(',').slice(1).join(',').trim()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Place Info */}
              {selectedCustomPlace && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Selected Location</span>
                  </div>
                  <p className="text-sm text-green-700 mb-1">
                    {selectedCustomPlace.display_name}
                  </p>
                  <p className="text-xs text-green-600">
                    We'll search for hotels, restaurants, attractions & more nearby. The AI will use real place names from OpenStreetMap data.
                  </p>
                </div>
              )}

              {/* Requirements Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Select your interest & duration preferences above, then click "Generate Custom Plan" to create an itinerary using REAL places from OpenStreetMap data for this exact location.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeCustomExplore}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateCustomItinerary}
                disabled={!selectedCustomPlace || !selectedInterest || !selectedDuration || isLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching Places...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Custom Plan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default PlanTrip;
