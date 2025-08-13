import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface UseGoogleMapsProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  mapId?: string;
}

export function useGoogleMaps({
  center = { lat: 6.9271, lng: 79.8612 }, // Default to Colombo
  zoom = 12,
  mapId,
}: UseGoogleMapsProps = {}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
      libraries: ["places", "geometry"],
    });

    loader
      .load()
      .then(() => {
        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapId,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });
        }
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
        setLoadError("Failed to load Google Maps");
      });
  }, [center.lat, center.lng, zoom, mapId]);

  const updateMapCenter = (
    newCenter: { lat: number; lng: number },
    newZoom?: number
  ) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(newCenter);
      if (newZoom) {
        mapInstanceRef.current.setZoom(newZoom);
      }
    }
  };

  const addMarker = (
    position: { lat: number; lng: number },
    options?: google.maps.MarkerOptions
  ) => {
    if (mapInstanceRef.current) {
      return new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        ...options,
      });
    }
    return null;
  };

  const addInfoWindow = (marker: google.maps.Marker, content: string) => {
    const infoWindow = new google.maps.InfoWindow({
      content,
    });

    marker.addListener("click", () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    return infoWindow;
  };

  const calculateRoute = async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) => {
    if (!isLoaded) return null;

    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      return result;
    } catch (error) {
      console.error("Error calculating route:", error);
      return null;
    }
  };

  const displayRoute = (directionsResult: google.maps.DirectionsResult) => {
    if (mapInstanceRef.current) {
      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#2563eb",
          strokeWeight: 4,
        },
      });
      directionsRenderer.setMap(mapInstanceRef.current);
      directionsRenderer.setDirections(directionsResult);
      return directionsRenderer;
    }
    return null;
  };

  return {
    mapRef,
    map: mapInstanceRef.current,
    isLoaded,
    loadError,
    updateMapCenter,
    addMarker,
    addInfoWindow,
    calculateRoute,
    displayRoute,
  };
}
