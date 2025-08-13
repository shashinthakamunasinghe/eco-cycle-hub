// Location utilities for Google Maps integration

export interface LocationInfo {
  location: { lat: number; lng: number } | null;
  locationAddress: string | null;
  autoLocation: boolean;
  coordinates?: { lat: number; lng: number } | null;
}

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Reverse geocode coordinates to get human-readable address
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not found, using coordinates as fallback");
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === "OK" && data.results.length > 0) {
      // Get the most appropriate address (usually the first one)
      const address = data.results[0].formatted_address;
      return address;
    } else if (data.status === "ZERO_RESULTS") {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)} (No address found)`;
    } else {
      console.warn("Geocoding API error:", data.status, data.error_message);
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    // Fallback to coordinates display
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

/**
 * Get current position using browser geolocation API
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Get current location with address
 */
export const getCurrentLocationWithAddress = async (): Promise<{
  coordinates: { lat: number; lng: number };
  address: string;
}> => {
  const position = await getCurrentPosition();
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const address = await reverseGeocode(lat, lng);
  
  return {
    coordinates: { lat, lng },
    address
  };
};
