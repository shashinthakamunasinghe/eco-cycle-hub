# Live Tracking Feature Documentation

## Overview

The live tracking feature provides real-time route updates from the collector's current GPS location to pickup destinations. This enhances navigation efficiency and provides accurate arrival estimates.

## Security Features

- **Permission Validation**: Checks for geolocation API availability and user permissions
- **Collector Authentication**: Basic security checks (can be enhanced with role-based access)
- **Secure Location Handling**: GPS coordinates are processed client-side and not stored permanently
- **User Control**: Collectors can manually start/stop live tracking

## How It Works

### 1. Navigation Mode Auto-Tracking

- When a collector enters navigation mode for a specific pickup
- Live tracking automatically activates if permissions are available
- Route updates every 15 seconds or when location changes significantly (>10 meters)

### 2. Manual Live Tracking

- Available in both regular map view and navigation mode
- Collectors can manually start/stop live tracking via UI controls
- Visual indicators show tracking status (red pulsing icon when active)

### 3. Intelligent Route Updates

- **Distance Threshold**: Only updates route if collector has moved >10 meters
- **Time Interval**: Automatic updates every 15 seconds
- **Location Accuracy**: Respects the existing GPS accuracy filtering (≤100m)
- **Performance Optimized**: Prevents unnecessary API calls

## Technical Implementation

### Components Modified

1. **CollectorMapComponent.tsx**

   - Added `enableLiveTracking` prop
   - Live tracking state management
   - Route update logic with distance calculations
   - UI controls for manual tracking

2. **collector-map/page.tsx**
   - Enabled live tracking for both regular and navigation modes
   - Navigation mode: auto-start tracking
   - Regular mode: manual control

### Key Functions

- `startLiveTracking()`: Initiates live route updates
- `stopLiveTracking()`: Stops tracking and cleans up intervals
- `updateLiveRoute()`: Calculates and displays updated route
- `calculateDistance()`: Determines if route update is needed

### Security Considerations

- Geolocation permission validation
- Client-side only processing
- No persistent storage of location data
- User-controlled activation

## Usage Examples

### Automatic in Navigation Mode

```tsx
<CollectorMapComponent
  pickups={[selectedPickup]}
  currentLocation={currentLocation}
  navigationMode={true}
  autoShowRoute={true}
  enableLiveTracking={true} // Auto-starts in nav mode
/>
```

### Manual Control in Regular Mode

```tsx
<CollectorMapComponent
  pickups={allPickups}
  currentLocation={currentLocation}
  enableLiveTracking={true} // Manual start/stop via UI
/>
```

## Visual Indicators

### Live Tracking Status

- 🔴 **Red Pulsing Icon**: Live tracking active
- ⚪ **Gray Icon**: Live tracking inactive
- ⚠️ **Warning Message**: Missing location permissions

### Map Updates

- Route line updates automatically as collector moves
- Map center follows collector's current location
- Destination markers remain fixed

## Performance Notes

- Route calculations throttled to prevent API abuse
- Distance-based updates reduce unnecessary calls
- Automatic cleanup prevents memory leaks
- 15-second update interval balances accuracy vs. performance

## Future Enhancements

1. **ETA Calculations**: Real-time arrival time estimates
2. **Traffic Integration**: Route optimization based on traffic
3. **Offline Mode**: Cached routes for poor connectivity areas
4. **Analytics**: Route efficiency tracking
5. **Multi-destination**: Live tracking for multiple pickups

## Testing

To test the live tracking feature:

1. Navigate to collector map page
2. Ensure location permissions are granted
3. Enter navigation mode for a pickup
4. Move around to see route updates (or simulate in browser dev tools)
5. Verify manual start/stop controls work in regular map view
