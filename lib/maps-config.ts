// Google Maps configuration and utilities

export const MAP_DEFAULTS = {
  // Default center (Colombo, Sri Lanka)
  center: { lat: 6.9271, lng: 79.8612 },
  zoom: 12,

  // Map styling
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
  ],
};

export const MARKER_ICONS = {
  collector: {
    available:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMyMkMzNTUiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgN2gxOGwtMiA5SDVsLTItOXoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Im03IDd2MTBhMSAxIDAgMCAwIDEgMWg4YTEgMSAwIDAgMCAxLTFWNyIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPg==",
    busy: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMzQjgyRjYiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgN2gxOGwtMiA5SDVsLTItOXoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Im03IDd2MTBhMSAxIDAgMCAwIDEgMWg4YTEgMSAwIDAgMCAxLTFWNyIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPg==",
  },

  pickup: {
    high: "#EF4444",
    medium: "#F59E0B",
    low: "#F97316",
  },

  status: {
    assigned: "#6B7280",
    "on-way": "#3B82F6",
    "picked-up": "#F59E0B",
    completed: "#10B981",
  },

  currentLocation:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxRjJBMzciLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+",
};

export const ROUTE_OPTIONS = {
  strokeColor: "#2563eb",
  strokeWeight: 4,
  strokeOpacity: 0.8,
};

export const INFO_WINDOW_STYLES = `
  <style>
    .gm-style-iw-chr {
      display: none;
    }
    .gm-style-iw-d {
      overflow: hidden !important;
    }
    .gm-style .gm-style-iw-c {
      max-width: 320px !important;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
  </style>
`;

// Utility functions
export const createMarkerIcon = (color: string, size: number = 32) => ({
  url: `data:image/svg+xml;base64,${btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${color}"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `)}`,
  scaledSize: new google.maps.Size(size, size),
});

export const formatInfoWindowContent = (data: any) => {
  return `
    ${INFO_WINDOW_STYLES}
    <div class="p-3 min-w-48">
      ${data.content}
    </div>
  `;
};

export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const openExternalNavigation = (destination: {
  lat: number;
  lng: number;
}) => {
  const { lat, lng } = destination;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  window.open(url, "_blank");
};
