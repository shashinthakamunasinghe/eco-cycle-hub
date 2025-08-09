# Admin Dashboard Collectors - Firestore Integration

## Overview
Updated the admin dashboard collectors section to load collectors from Firestore instead of using mock data. The implementation includes proper Firebase integration, loading states, error handling, and the ability to add new collectors.

## Changes Made

### 1. Firebase Services Enhancement (`lib/firebase-services.ts`)
- Added `collectorService` with the following methods:
  - `getAllCollectors()` - Get all users with role "collector"
  - `getCollector(id)` - Get a specific collector by ID
  - `getAvailableCollectors()` - Get only available collectors
  - `updateCollectorAvailability(id, isAvailable)` - Toggle collector availability
  - `updateCollectorLocation(id, location)` - Update collector's current location
  - `updateCollectorCapacity(id, truckCapacity, currentLoad)` - Update vehicle capacity info
  - `assignRequestToCollector(collectorId, requestId)` - Assign pickup request to collector
  - `removeRequestFromCollector(collectorId, requestId)` - Remove assignment

### 2. Type Definitions Update (`types/index.ts`)
- Extended the `User` interface to include collector-specific properties:
  - `isAvailable?: boolean` - Whether collector is currently available
  - `currentLocation?: { lat: number; lng: number }` - Current GPS location
  - `truckCapacity?: number` - Maximum capacity in kg
  - `currentLoad?: number` - Current load in kg
  - `assignedRequests?: string[]` - Array of assigned pickup request IDs

### 3. Admin Collectors Page Update (`app/(admin)/collectors/page.tsx`)
#### Major Changes:
- **Firestore Integration**: 
  - Fetches collectors from Firestore using `collectorService.getAllCollectors()`
  - Proper error handling with fallback to mock data if Firestore fails
  - Loading states for better UX

- **Enhanced Add Collector Feature**:
  - Uses Firebase Authentication to create collector accounts
  - Properly integrates with `useFirebaseAuth` hook
  - Loading state during account creation
  - Automatic addition to collectors list after creation

- **Improved State Management**:
  - Uses proper TypeScript types (`User` instead of `any`)
  - Null checking for optional properties
  - Async operations for availability toggling

- **Better Error Handling**:
  - Try-catch blocks for all Firebase operations
  - User-friendly error messages via toast notifications
  - Graceful degradation to mock data when needed

#### New Features:
- Loading spinner while fetching collectors
- Real-time availability toggling that updates Firestore
- Proper handling of optional collector properties
- Enhanced form validation and loading states

### 4. Sample Data Script (`scripts/create-sample-collectors.js`)
- Created a script to generate sample collector data
- Includes 4 sample collectors with various states (available/offline, different capacities)
- Can be used to populate Firestore for testing

## Key Technical Improvements

### Type Safety
- Replaced `any` types with proper `User` interface
- Added null checks for optional properties
- Proper TypeScript error handling

### User Experience
- Loading states for all async operations
- Proper error messages and feedback
- Graceful fallbacks when Firestore is unavailable

### Firebase Integration
- Proper use of Firestore queries with filters
- Timestamp handling for created/updated dates
- Structured data following Firestore best practices

## Data Structure in Firestore

Collectors are stored in the `users` collection with the following structure:

```json
{
  "id": "collector_id",
  "name": "John Doe",
  "email": "john.collector@example.com",
  "role": "collector",
  "phone": "+94771234567",
  "isAvailable": true,
  "currentLocation": {
    "lat": 6.9271,
    "lng": 79.8612
  },
  "truckCapacity": 1200,
  "currentLoad": 300,
  "assignedRequests": ["req1", "req2"],
  "createdAt": "2025-08-08T13:18:45.097Z",
  "updatedAt": "2025-08-08T13:18:45.097Z"
}
```

## Usage

### Setting Up Sample Data
1. Add collectors manually via Firebase Console
2. Or use the provided script in `scripts/create-sample-collectors.js`
3. Or use the "Add Collector" button in the admin dashboard

### Testing the Integration
1. Navigate to `/collectors` in the admin dashboard
2. The page will automatically fetch collectors from Firestore
3. Use the search functionality to filter collectors
4. Toggle availability status (updates Firestore)
5. View detailed collector information in the dialog
6. Add new collectors using the form

## Future Enhancements
- Real-time updates using Firestore listeners
- Batch operations for multiple collectors
- Advanced filtering and sorting options
- Collector performance analytics
- Integration with pickup request assignment
