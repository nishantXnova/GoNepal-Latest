import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    MapPin, Phone, User, Cloud, AlertTriangle, 
    WifiOff, Wifi, Clock, ChevronDown, ChevronUp,
    Globe, Shield, PhoneCall, Building2, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    getCachedTrip, 
    isWeatherStale, 
    CachedTripData,
    DigitalID 
} from "@/lib/offlineService";
import { 
    NEPAL_EMERGENCY_CONTACTS, 
    NATIONAL_EMERGENCY, 
    TREKKING_EMERGENCY,
    findNearestDistrict,
    createEmergencySMS,
    getTrekkingRegions,
    DistrictEmergencyContact
} from "@/lib/emergencyContacts";
import { getSecureLocation, isGeolocationSupported, getLocationPermissionStatus } from "@/lib/locationService";
import { 
    HACE_DATA, 
    HAPE_DATA, 
    ALTITUDE_CONDITIONS, 
    getAltitudeRiskAssessment,
    TREKKING_REGION_ALTITUDES
} from "@/lib/altitudeSickness";

interface OfflineToolkitProps {
    isOpen: boolean;
    onClose: () => void;
}

const OfflineToolkit: React.FC<OfflineToolkitProps> = ({ isOpen, onClose }) => {
    const [cachedData, setCachedData] = useState<CachedTripData | null>(null);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        homeBase: true,
        emergency: true,
        digitalID: true,
        weather: true,
        districtEmergency: true,
        altitudeSickness: true,
    });
    
    // GPS Detection State
    const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
    const [nearestDistrictContact, setNearestDistrictContact] = useState<DistrictEmergencyContact | null>(null);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    
    // Altitude Sickness Section State
    const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
    const [userAltitude, setUserAltitude] = useState<number | null>(null);

    // Get trekking regions for emergency contacts
    const trekkingRegions = getTrekkingRegions();

    // Function to detect GPS and find nearest emergency contacts
    const detectMyLocation = async () => {
        setIsDetectingLocation(true);
        setLocationError(null);
        
        try {
            // Check if geolocation is supported
            if (!isGeolocationSupported()) {
                setLocationError("Geolocation is not supported on this device");
                return;
            }
            
            // Check permission status
            const permissionStatus = await getLocationPermissionStatus();
            if (permissionStatus.status === 'denied') {
                setLocationError("Location permission denied. Please enable in browser settings.");
                return;
            }
            
            // Get secure location
            const location = await getSecureLocation();
            
            setUserLocation({ lat: location.lat, lng: location.lng });
            
            // Find nearest district based on GPS
            const nearestContact = findNearestDistrict(location.lat, location.lng);
            setNearestDistrictContact(nearestContact);
            
        } catch (error) {
            setLocationError(error instanceof Error ? error.message : "Failed to get location");
        } finally {
            setIsDetectingLocation(false);
        }
    };

    // Load cached data and monitor online/offline status
    useEffect(() => {
        const loadCachedData = () => {
            const data = getCachedTrip();
            setCachedData(data);
        };

        const updateOnlineStatus = () => {
            setIsOfflineMode(!navigator.onLine);
        };

        // Initial load
        loadCachedData();
        updateOnlineStatus();

        // Event listeners for online/offline
        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOnlineStatus);

        // Refresh cached data periodically when online
        const interval = setInterval(loadCachedData, 30000);

        return () => {
            window.removeEventListener("online", updateOnlineStatus);
            window.removeEventListener("offline", updateOnlineStatus);
            clearInterval(interval);
        };
    }, []);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isStale = cachedData ? isWeatherStale(cachedData.timestamp) : false;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 p-4 rounded-t-3xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="h-6 w-6 text-nepal-gold" />
                                <h2 className="text-xl font-bold text-white">Offline Toolkit</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {isOfflineMode ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">
                                        <WifiOff className="h-3 w-3" />
                                        OFFLINE MODE
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                                        <Wifi className="h-3 w-3" />
                                        ONLINE
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
                        {cachedData && (
                            <div className="flex items-center gap-1.5 mt-2 text-slate-400 text-xs">
                                <Clock className="h-3 w-3" />
                                Last synced: {formatTimestamp(cachedData.timestamp)}
                            </div>
                        )}
                    </div>

                    <div className="p-4 space-y-4">
                        {/* GPS Detection & Nearest Emergency Section */}
                        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl border border-purple-700/50 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg">
                                            <Navigation className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Detect My Location</h3>
                                            <p className="text-sm text-purple-300/70">Find emergency contacts near you</p>
                                        </div>
                                    </div>
                                    
                                    {/* Disclaimer - Must Accept Before Detection */}
                                    <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                                        <div className="flex items-start gap-2 mb-2">
                                            <input
                                                type="checkbox"
                                                id="locationDisclaimer"
                                                checked={acceptedPrivacy}
                                                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded accent-yellow-500"
                                            />
                                            <label htmlFor="locationDisclaimer" className="text-yellow-200 text-xs leading-relaxed">
                                                <strong className="text-yellow-100">⚠️ Privacy Notice:</strong> This feature requires your device's GPS location to find the nearest emergency services. Your location is processed locally on your device and is <strong>never stored or transmitted</strong> to any server. By using this feature, you agree to share your location with your device's browser for emergency contact purposes only.
                                            </label>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <input
                                                type="checkbox"
                                                id="emergencyDisclaimer"
                                                checked={acceptedTerms}
                                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded accent-yellow-500"
                                            />
                                            <label htmlFor="emergencyDisclaimer" className="text-yellow-200 text-xs leading-relaxed">
                                                <strong className="text-yellow-100">📱 Usage Agreement:</strong> Emergency numbers are provided as a reference only. GoNepal is not responsible for emergency service availability, response times, or call connectivity. In life-threatening situations, also contact local authorities through official channels.
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={detectMyLocation}
                                        disabled={isDetectingLocation || !acceptedPrivacy || !acceptedTerms}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        {isDetectingLocation ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                Detecting...
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="h-4 w-4" />
                                                {(acceptedPrivacy && acceptedTerms) ? 'Detect' : 'Accept Disclaimers First'}
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                {locationError && (
                                    <div className="mb-3 p-2 bg-red-900/30 border border-red-800/50 rounded-lg text-red-300 text-sm">
                                        {locationError}
                                    </div>
                                )}
                                
                                {userLocation && nearestDistrictContact && (
                                    <div className="bg-slate-900/60 rounded-xl p-3 border border-purple-800/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="text-white font-semibold">{nearestDistrictContact.district}</p>
                                                <p className="text-purple-300 text-sm">{nearestDistrictContact.province}</p>
                                            </div>
                                            {nearestDistrictContact.isTrekkingRegion && (
                                                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">
                                                    🏔️ Trekking Zone
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            <a 
                                                href={`tel:${nearestDistrictContact.police}`}
                                                className="flex flex-col items-center justify-center bg-red-600/30 hover:bg-red-600/50 rounded-lg p-2 transition-colors"
                                            >
                                                <PhoneCall className="h-4 w-4 text-red-300 mb-1" />
                                                <span className="text-white text-xs font-medium">Police</span>
                                                <span className="text-red-200 text-xs">{nearestDistrictContact.police}</span>
                                            </a>
                                            <a 
                                                href={`tel:${nearestDistrictContact.ambulance}`}
                                                className="flex flex-col items-center justify-center bg-blue-600/30 hover:bg-blue-600/50 rounded-lg p-2 transition-colors"
                                            >
                                                <PhoneCall className="h-4 w-4 text-blue-300 mb-1" />
                                                <span className="text-white text-xs font-medium">Ambulance</span>
                                                <span className="text-blue-200 text-xs">{nearestDistrictContact.ambulance}</span>
                                            </a>
                                            <a 
                                                href={`tel:${nearestDistrictContact.fire}`}
                                                className="flex flex-col items-center justify-center bg-orange-600/30 hover:bg-orange-600/50 rounded-lg p-2 transition-colors"
                                            >
                                                <PhoneCall className="h-4 w-4 text-orange-300 mb-1" />
                                                <span className="text-white text-xs font-medium">Fire</span>
                                                <span className="text-orange-200 text-xs">{nearestDistrictContact.fire}</span>
                                            </a>
                                        </div>
                                        
                                        <div className="text-xs text-slate-400 space-y-1">
                                            <p className="flex items-center gap-1">
                                                <Building2 className="h-3 w-3" />
                                                <span>Hospital: </span>
                                                <span className="text-slate-300">{nearestDistrictContact.hospital}</span>
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>Police Station: </span>
                                                <span className="text-slate-300">{nearestDistrictContact.policeStation}</span>
                                            </p>
                                        </div>
                                        
                                        {nearestDistrictContact.helicopter && (
                                            <div className="mt-2 pt-2 border-t border-purple-800/30">
                                                <a 
                                                    href={`tel:${nearestDistrictContact.helicopter}`}
                                                    className="flex items-center justify-center gap-2 w-full bg-purple-600/30 hover:bg-purple-600/50 rounded-lg p-2 transition-colors"
                                                >
                                                    <span className="text-lg">🚁</span>
                                                    <span className="text-purple-200 text-sm font-medium">Helicopter Rescue: {nearestDistrictContact.helicopter}</span>
                                                </a>
                                            </div>
                                        )}
                                        
                                        {/* Trekking-specific fields (only show when isTrekkingRegion is true) */}
                                        {nearestDistrictContact.isTrekkingRegion && (
                                            <div className="mt-2 pt-2 border-t border-purple-800/30 space-y-2">
                                                <p className="text-purple-200 text-xs font-semibold">🏔️ Trekking Info</p>
                                                {nearestDistrictContact.altitudeMin && nearestDistrictContact.altitudeMax && (
                                                    <p className="text-slate-400 text-xs">
                                                        <span className="text-purple-300">Altitude:</span> {nearestDistrictContact.altitudeMin}m - {nearestDistrictContact.altitudeMax}m
                                                    </p>
                                                )}
                                                {nearestDistrictContact.nearestHelipad && (
                                                    <p className="text-slate-400 text-xs">
                                                        <span className="text-purple-300">Nearest Helipad:</span> {nearestDistrictContact.nearestHelipad}
                                                    </p>
                                                )}
                                                {nearestDistrictContact.helicopterCompany && (
                                                    <p className="text-slate-400 text-xs">
                                                        <span className="text-purple-300">Helicopters:</span> {nearestDistrictContact.helicopterCompany}
                                                    </p>
                                                )}
                                                {nearestDistrictContact.nearestSettlement && (
                                                    <p className="text-slate-400 text-xs">
                                                        <span className="text-purple-300">Nearest Town:</span> {nearestDistrictContact.nearestSettlement}
                                                    </p>
                                                )}
                                                {nearestDistrictContact.difficultyLevel && (
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${// In OfflineToolkit.tsx
                                                        nearestDistrictContact.difficultyLevel === 'extreme' ? 'bg-red-500/30 text-red-300' :
                                                        nearestDistrictContact.difficultyLevel === 'difficult' ? 'bg-orange-500/30 text-orange-300' :
                                                        nearestDistrictContact.difficultyLevel === 'moderate' ? 'bg-yellow-500/30 text-yellow-300' :
                                                        'bg-green-500/30 text-green-300'
                                                    }`}>
                                                        Difficulty: {nearestDistrictContact.difficultyLevel}
                                                    </span>
                                                )}
                                                {/* Season Awareness */}
                                                {nearestDistrictContact.bestMonths && nearestDistrictContact.bestMonths.length > 0 && (
                                                    <p className="text-slate-400 text-xs mt-1">
                                                        <span className="text-cyan-300">Best Months:</span> {nearestDistrictContact.bestMonths.join(', ')}
                                                    </p>
                                                )}
                                                {nearestDistrictContact.monsoonWarning && (
                                                    <p className="text-yellow-500 text-xs">⚠️ Monsoon: Jun-Sep (landslides, floods)</p>
                                                )}
                                                {nearestDistrictContact.winterWarning && (
                                                    <p className="text-blue-400 text-xs">❄️ Winter: Dec-Feb (extreme cold, snow)</p>
                                                )}
                                                {nearestDistrictContact.trekkingSeasonOpen === false && (
                                                    <p className="text-red-400 text-xs font-semibold">🚫 Trekking NOT Recommended Currently</p>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* SMS Emergency Button */}
                                        <div className="mt-2">
                                            <a
                                                href={`sms:${NATIONAL_EMERGENCY.emergencySMS}?body=${createEmergencySMS(userLocation.lat, userLocation.lng)}`}
                                                className="flex items-center justify-center gap-2 w-full bg-green-600/30 hover:bg-green-600/50 rounded-lg p-2 transition-colors"
                                            >
                                                <PhoneCall className="h-4 w-4 text-green-300" />
                                                <span className="text-green-200 text-sm">Send Emergency SMS with GPS</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                                
                                {userLocation && !nearestDistrictContact && (
                                    <div className="p-2 bg-yellow-900/30 border border-yellow-800/50 rounded-lg text-yellow-300 text-sm">
                                        Location detected but no matching district found. Using national emergency numbers.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Altitude Sickness Emergency Guide */}
                        <div className="bg-red-950/30 rounded-2xl border border-red-800/30 overflow-hidden">
                            <button
                                onClick={() => toggleSection("altitudeSickness")}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-red-900/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-red-100">Altitude Sickness Guide</h3>
                                        <p className="text-sm text-red-300/70">HACE, HAPE, AMS - Know the signs</p>
                                    </div>
                                </div>
                                {expandedSections.altitudeSickness ? (
                                    <ChevronUp className="h-5 w-5 text-red-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-red-400" />
                                )}
                            </button>
                            {expandedSections.altitudeSickness && (
                                <div className="px-4 pb-4 pt-0 space-y-3">
                                    {/* Quick Emergency Checklist */}
                                    <div className="bg-red-900/20 rounded-xl p-3 border border-red-800/20">
                                        <p className="text-red-200 font-semibold text-sm mb-2">⚠️ When in doubt - DESCEND!</p>
                                        <div className="space-y-1 text-xs text-red-300">
                                            <p>• Can you walk in a straight line? → No = HACE → DESCEND</p>
                                            <p>• Blue lips or pink sputum? → HAPE → DESCEND IMMEDIATELY</p>
                                            <p>• Symptoms getting worse? → DESCEND - never wait</p>
                                        </div>
                                    </div>

                                    {/* HACE Quick Reference */}
                                    <div 
                                        className={`bg-slate-900/50 rounded-xl p-3 border cursor-pointer transition-colors ${
                                            selectedCondition === 'HACE' ? 'border-red-500' : 'border-slate-700/50'
                                        }`}
                                        onClick={() => setSelectedCondition(selectedCondition === 'HACE' ? null : 'HACE')}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-red-400 font-semibold">HACE</span>
                                            <span className="text-red-500 text-xs font-bold">CEREBRAL EDEMA</span>
                                        </div>
                                        <p className="text-slate-400 text-xs mb-2">Brain swelling - HEADACHE + CONFUSION + ATAXIA</p>
                                        <p className="text-red-400 text-xs">⏱️ Mortality: ~50% untreated | Descend IMMEDIATELY</p>
                                        {selectedCondition === 'HACE' && (
                                            <div className="mt-2 pt-2 border-t border-red-800/30">
                                                <p className="text-orange-300 text-xs font-semibold mb-1">Treatment:</p>
                                                <ul className="text-xs text-slate-400 space-y-1">
                                                    <li>• DESCEND - lowest point possible</li>
                                                    <li>• Oxygen if available (2-4 L/min)</li>
                                                    <li>• Dexamethasone 8mg initially</li>
                                                    <li>• Keep warm, don't leave alone</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* HAPE Quick Reference */}
                                    <div 
                                        className={`bg-slate-900/50 rounded-xl p-3 border cursor-pointer transition-colors ${
                                            selectedCondition === 'HAPE' ? 'border-red-500' : 'border-slate-700/50'
                                        }`}
                                        onClick={() => setSelectedCondition(selectedCondition === 'HAPE' ? null : 'HAPE')}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-red-400 font-semibold">HAPE</span>
                                            <span className="text-red-500 text-xs font-bold">PULMONARY EDEMA</span>
                                        </div>
                                        <p className="text-slate-400 text-xs mb-2">Fluid in lungs - BREATHLESS + COUGH + PINK SPUTUM</p>
                                        <p className="text-red-400 text-xs">⏱️ Mortality: ~50% untreated | Descend IMMEDIATELY</p>
                                        {selectedCondition === 'HAPE' && (
                                            <div className="mt-2 pt-2 border-t border-red-800/30">
                                                <p className="text-orange-300 text-xs font-semibold mb-1">Treatment:</p>
                                                <ul className="text-xs text-slate-400 space-y-1">
                                                    <li>• DESCEND - sit upright, don't lie flat</li>
                                                    <li>• Oxygen if available (4-6 L/min)</li>
                                                    <li>• Nifedipine 20mg initially</li>
                                                    <li>• Keep warm, minimize exertion</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* AMS Quick Reference */}
                                    <div 
                                        className={`bg-slate-900/50 rounded-xl p-3 border cursor-pointer transition-colors ${
                                            selectedCondition === 'AMS' ? 'border-yellow-500' : 'border-slate-700/50'
                                        }`}
                                        onClick={() => setSelectedCondition(selectedCondition === 'AMS' ? null : 'AMS')}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-yellow-400 font-semibold">AMS</span>
                                            <span className="text-yellow-500 text-xs font-bold">MILD</span>
                                        </div>
                                        <p className="text-slate-400 text-xs mb-2">Headache + fatigue + nausea - usually resolves with rest</p>
                                        <p className="text-yellow-400 text-xs">⏱️ Rest and acclimatize - descend if worsens</p>
                                        {selectedCondition === 'AMS' && (
                                            <div className="mt-2 pt-2 border-t border-yellow-800/30">
                                                <p className="text-yellow-300 text-xs font-semibold mb-1">Treatment:</p>
                                                <ul className="text-xs text-slate-400 space-y-1">
                                                    <li>• Rest at current altitude</li>
                                                    <li>• Stay hydrated (3-4L water)</li>
                                                    <li>• Avoid alcohol</li>
                                                    <li>• Acetaminophen for headache</li>
                                                    <li>• Descend if no improvement in 24h</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Risk at Current Altitude */}
                                    {nearestDistrictContact && nearestDistrictContact.altitudeMax && (
                                        <div className="bg-orange-900/20 rounded-xl p-3 border border-orange-800/20">
                                            <p className="text-orange-200 font-semibold text-sm mb-2">📍 Your Region: {nearestDistrictContact.district}</p>
                                            <p className="text-slate-400 text-xs">
                                                Altitude range: Up to {nearestDistrictContact.altitudeMax}m
                                                {nearestDistrictContact.altitudeMax >= 5500 && (
                                                    <span className="text-red-400 ml-2">⚠️ EXTREME - Death zone!</span>
                                                )}
                                                {nearestDistrictContact.altitudeMax >= 4000 && nearestDistrictContact.altitudeMax < 5500 && (
                                                    <span className="text-orange-400 ml-2">⚠️ High risk area</span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Home Base Section */}
                        {cachedData?.homeCoords && (
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                                <button
                                    onClick={() => toggleSection("homeBase")}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <MapPin className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Home Base</h3>
                                            <p className="text-sm text-slate-400">{cachedData.homeCoords.address}</p>
                                        </div>
                                    </div>
                                    {expandedSections.homeBase ? (
                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                    )}
                                </button>
                                {expandedSections.homeBase && (
                                    <div className="px-4 pb-4 pt-0">
                                        <div className="bg-slate-900/50 rounded-xl p-3 text-sm">
                                            <p className="text-slate-400">
                                                <span className="text-slate-500">Coordinates:</span>{" "}
                                                <span className="font-mono text-blue-300">
                                                    {cachedData.homeCoords.lat.toFixed(4)}, {cachedData.homeCoords.lng.toFixed(4)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Emergency Phrases Section */}
                        {cachedData?.emergencyPhrases && cachedData.emergencyPhrases.length > 0 && (
                            <div className="bg-red-950/30 rounded-2xl border border-red-800/30 overflow-hidden">
                                <button
                                    onClick={() => toggleSection("emergency")}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-red-900/20 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/20 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-red-100">Emergency Phrases</h3>
                                            <p className="text-sm text-red-300/70">{cachedData.emergencyPhrases.length} phrases</p>
                                        </div>
                                    </div>
                                    {expandedSections.emergency ? (
                                        <ChevronUp className="h-5 w-5 text-red-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-red-400" />
                                    )}
                                </button>
                                {expandedSections.emergency && (
                                    <div className="px-4 pb-4 pt-0 space-y-2 max-h-64 overflow-y-auto">
                                        {cachedData.emergencyPhrases.map((phrase, index) => (
                                            <div 
                                                key={index} 
                                                className="bg-red-900/20 rounded-xl p-3 border border-red-800/20"
                                            >
                                                <p className="text-white text-sm font-medium">{phrase.english}</p>
                                                <p className="text-red-300 text-sm mt-1">{phrase.nepali}</p>
                                                <p className="text-slate-400 text-xs mt-1 italic">{phrase.phonetic}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Digital ID Section */}
                        {cachedData?.digitalID && (
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                                <button
                                    onClick={() => toggleSection("digitalID")}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-nepal-gold/20 rounded-lg">
                                            <User className="h-5 w-5 text-nepal-gold" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Digital ID</h3>
                                            <p className="text-sm text-slate-400">{cachedData.digitalID.name}</p>
                                        </div>
                                    </div>
                                    {expandedSections.digitalID ? (
                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                    )}
                                </button>
                                {expandedSections.digitalID && (
                                    <div className="px-4 pb-4 pt-0">
                                        <div className="bg-slate-900/50 rounded-xl p-3 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">Passport</span>
                                                <span className="text-white font-mono">{cachedData.digitalID.passportNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">Nationality</span>
                                                <span className="text-white">{cachedData.digitalID.nationality}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">Date of Birth</span>
                                                <span className="text-white">{cachedData.digitalID.dob}</span>
                                            </div>
                                            <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                                                <Phone className="h-4 w-4 text-red-400" />
                                                <span className="text-slate-500 text-sm">Emergency:</span>
                                                <span className="text-white">{cachedData.digitalID.emergencyContact}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Weather Section */}
                        {cachedData?.weather && (
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                                <button
                                    onClick={() => toggleSection("weather")}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                                            <Cloud className="h-5 w-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Weather</h3>
                                            <p className="text-sm text-slate-400">{cachedData.weather.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isOfflineMode && isStale && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">
                                                <Clock className="h-3 w-3" />
                                                cached
                                            </span>
                                        )}
                                        {expandedSections.weather ? (
                                            <ChevronUp className="h-5 w-5 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                </button>
                                {expandedSections.weather && (
                                    <div className="px-4 pb-4 pt-0">
                                        <div className="bg-slate-900/50 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-3xl font-bold text-white">
                                                        {cachedData.weather.temp}°C
                                                    </p>
                                                    <p className="text-slate-400">{cachedData.weather.condition}</p>
                                                </div>
                                                {isOfflineMode && isStale && (
                                                    <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 px-3 py-2 rounded-lg">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <span>cached weather may be old</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* District Emergency Contacts Section */}
                        {trekkingRegions.length > 0 && (
                            <div className="bg-orange-950/30 rounded-2xl border border-orange-800/30 overflow-hidden">
                                <button
                                    onClick={() => toggleSection("districtEmergency")}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-orange-900/20 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-500/20 rounded-lg">
                                            <Building2 className="h-5 w-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-orange-100">Emergency Contacts</h3>
                                            <p className="text-sm text-orange-300/70">{trekkingRegions.length} districts</p>
                                        </div>
                                    </div>
                                    {expandedSections.districtEmergency ? (
                                        <ChevronUp className="h-5 w-5 text-orange-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-orange-400" />
                                    )}
                                </button>
                                {expandedSections.districtEmergency && (
                                    <div className="px-4 pb-4 pt-0 space-y-3">
                                        {/* National Emergency Numbers */}
                                        <div className="bg-orange-900/20 rounded-xl p-3 border border-orange-800/20">
                                            <p className="text-orange-200 font-semibold text-sm mb-2">National Emergency</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                <a 
                                                    href={`tel:${NATIONAL_EMERGENCY.police}`}
                                                    className="flex items-center justify-center gap-1 bg-red-600/30 hover:bg-red-600/50 rounded-lg p-2 transition-colors"
                                                >
                                                    <PhoneCall className="h-4 w-4 text-red-300" />
                                                    <span className="text-white text-sm font-medium">100</span>
                                                </a>
                                                <a 
                                                    href={`tel:${NATIONAL_EMERGENCY.ambulance}`}
                                                    className="flex items-center justify-center gap-1 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg p-2 transition-colors"
                                                >
                                                    <PhoneCall className="h-4 w-4 text-blue-300" />
                                                    <span className="text-white text-sm font-medium">102</span>
                                                </a>
                                                <a 
                                                    href={`tel:${NATIONAL_EMERGENCY.fire}`}
                                                    className="flex items-center justify-center gap-1 bg-orange-600/30 hover:bg-orange-600/50 rounded-lg p-2 transition-colors"
                                                >
                                                    <PhoneCall className="h-4 w-4 text-orange-300" />
                                                    <span className="text-white text-sm font-medium">101</span>
                                                </a>
                                            </div>
                                        </div>

                                        {/* Trekking Region Contacts */}
                                        <div className="max-h-64 overflow-y-auto space-y-2">
                                            {trekkingRegions.slice(0, 10).map((region) => (
                                                <div 
                                                    key={region.district} 
                                                    className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="text-white font-medium">{region.district}</p>
                                                            <p className="text-slate-400 text-xs">{region.province}</p>
                                                        </div>
                                                        {region.helicopter && (
                                                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                                                Helicopter
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <a 
                                                            href={`tel:${region.police}`}
                                                            className="flex items-center gap-1 text-blue-300 hover:text-blue-200"
                                                        >
                                                            <PhoneCall className="h-3 w-3" />
                                                            Police: {region.police}
                                                        </a>
                                                        <a 
                                                            href={`tel:${region.ambulance}`}
                                                            className="flex items-center gap-1 text-green-300 hover:text-green-200"
                                                        >
                                                            <PhoneCall className="h-3 w-3" />
                                                            Ambulance: {region.ambulance}
                                                        </a>
                                                        <span className="text-slate-500 col-span-2">
                                                            Hospital: {region.hospital}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="text-slate-500 text-xs text-center">
                                            Full list available in go-nepal offline mode
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* No Data Message */}
                        {!cachedData && (
                            <div className="text-center py-8">
                                <Globe className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No offline data available</p>
                                <p className="text-slate-500 text-sm mt-1">
                                    Use the app online to cache your trip data
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OfflineToolkit;
