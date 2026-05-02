import { logger } from '@/utils/logger';

// ============================================================================
// Types
// ============================================================================

export interface SecureLocation {
  id?: number;
  lat: number;
  lng: number;
  address?: string;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  userId?: string;
  isPinned: boolean;
  pinLabel?: string;
}

export interface LocationPermissionStatus {
  status: 'granted' | 'denied' | 'prompt' | 'unsupported';
  canRequest: boolean;
}

export interface GeocodingResult {
  address: string;
  placeName?: string;
  locality?: string;
  region?: string;
  country?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const LOCATION_CONFIG = {
  enableHighAccuracy: true,
  timeout: 30000, // 30 seconds - increased for better offline detection
  maximumAge: 300000, // 5 minutes cache
  // Minimum accuracy threshold (meters) - higher = more precise
  accuracyThreshold: 100,
} as const;

// ============================================================================
// Permission Handling
// ============================================================================

/**
 * Check if Geolocation API is supported
 */
export const isGeolocationSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
};

/**
 * Check current location permission status
 */
export const getLocationPermissionStatus = async (): Promise<LocationPermissionStatus> => {
  if (!isGeolocationSupported()) {
    return { status: 'unsupported', canRequest: false };
  }

  try {
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    
    switch (permissionStatus.state) {
      case 'granted':
        return { status: 'granted', canRequest: false };
      case 'denied':
        return { status: 'denied', canRequest: false };
      case 'prompt':
        return { status: 'prompt', canRequest: true };
    }
  } catch {
    // Fallback for browsers that don't support permissions API
    return { status: 'prompt', canRequest: true };
  }

  return { status: 'prompt', canRequest: true };
};

/**
 * Request location permission from user
 */
export const requestLocationPermission = async (): Promise<LocationPermissionStatus> => {
  if (!isGeolocationSupported()) {
    return { status: 'unsupported', canRequest: false };
  }

  return new Promise((resolve) => {
    // This will trigger the browser's permission prompt
    navigator.geolocation.getCurrentPosition(
      () => {
        // Permission granted
        resolve({ status: 'granted', canRequest: false });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ status: 'denied', canRequest: false });
        } else {
          resolve({ status: 'prompt', canRequest: true });
        }
      },
      { enableHighAccuracy: false }
    );
  });
};

// ============================================================================
// Secure Location Retrieval
// ============================================================================

/**
 * Get current position with security checks
 */
export const getSecureLocation = (): Promise<SecureLocation> => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
        
        // Validate coordinates are within reasonable bounds
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          reject(new Error('Invalid coordinates received'));
          return;
        }

        // Check accuracy threshold
        if (accuracy > LOCATION_CONFIG.accuracyThreshold) {
          logger.warn(`Location accuracy (${accuracy}m) exceeds threshold (${LOCATION_CONFIG.accuracyThreshold}m)`);
        }

        const location: SecureLocation = {
          lat: Math.round(latitude * 1000) / 1000, // Round to 3 decimal places for privacy
          lng: Math.round(longitude * 1000) / 1000,
          accuracy,
          altitude: altitude ?? undefined,
          heading: heading ?? undefined,
          speed: speed ?? undefined,
          timestamp: position.timestamp,
          isPinned: false,
        };

        // Try to get address (only when online)
        if (navigator.onLine) {
          try {
            const geocodeResult = await reverseGeocode(location.lat, location.lng);
            location.address = geocodeResult.address;
          } catch (e) {
            logger.warn('Geocoding failed, using coordinates only');
            location.address = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
          }
        } else {
          location.address = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        }

        resolve(location);
      },
      (error) => {
        let message = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: LOCATION_CONFIG.enableHighAccuracy,
        timeout: LOCATION_CONFIG.timeout,
        maximumAge: LOCATION_CONFIG.maximumAge,
      }
    );
  });
};

/**
 * Reverse geocode coordinates to address (requires online)
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodingResult> => {
  try {
    // Use Nominatim (OpenStreetMap) for free geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GonePal/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    return {
      address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      placeName: data.name,
      locality: data.address?.city || data.address?.town || data.address?.village,
      region: data.address?.state || data.address?.region,
      country: data.address?.country,
    };
  } catch (error) {
    logger.error('Reverse geocoding error:', error);
    throw error;
  }
};

/**
 * Watch position for continuous tracking
 */
export const watchPosition = (
  onSuccess: (location: SecureLocation) => void,
  onError: (error: Error) => void
): number => {
  if (!isGeolocationSupported()) {
    onError(new Error('Geolocation is not supported'));
    return -1;
  }

  return navigator.geolocation.watchPosition(
    async (position) => {
      const location: SecureLocation = {
        lat: Math.round(position.coords.latitude * 1000) / 1000,
        lng: Math.round(position.coords.longitude * 1000) / 1000,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude ?? undefined,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
        timestamp: position.timestamp,
        isPinned: false,
      };
      onSuccess(location);
    },
    (error) => {
      onError(new Error(error.message));
    },
    {
      enableHighAccuracy: LOCATION_CONFIG.enableHighAccuracy,
      timeout: LOCATION_CONFIG.timeout,
      maximumAge: 60000, // 1 minute for continuous tracking
    }
  );
};

/**
 * Stop watching position
 */
export const clearWatch = (watchId: number): void => {
  if (watchId >= 0) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// ============================================================================
// Privacy & Security Helpers
// ============================================================================

/**
 * Anonymize location for analytics/backend
 * Reduces precision based on privacy settings
 */
export const anonymizeLocation = (location: SecureLocation, precision: number = 3): SecureLocation => {
  const factor = Math.pow(10, precision);
  return {
    ...location,
    lat: Math.round(location.lat * factor) / factor,
    lng: Math.round(location.lng * factor) / factor,
    accuracy: undefined,
    altitude: undefined,
    heading: undefined,
    speed: undefined,
  };
};

/**
 * Check if location is within Nepal (for trekking app context)
 */
export const isLocationInNepal = (lat: number, lng: number): boolean => {
  return lat >= 26.0 && lat <= 30.5 && lng >= 80.0 && lng <= 88.5;
};

/**
 * Calculate distance between two points (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
