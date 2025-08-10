# Admin Collector Assignment Feature

## Overview
The admin dashboard now includes functionality to assign available collectors to pickup requests. This feature allows administrators to efficiently manage waste collection operations.

## Features

### 1. Real-time Collector Data
- The system fetches available collectors from Firestore in real-time
- Shows only collectors with `isAvailable: true` status
- Displays collector capacity and current load information

### 2. Pickup Request Management
- View all pickup requests with their current status
- Filter requests by status (pending, assigned, on-way, completed, cancelled)
- Search by industry name, waste type, or address

### 3. Collector Assignment
- **For Pending Requests**: Dropdown shows available collectors
- **Collector Information**: Name, current load, and truck capacity
- **Visual Indicators**: Green dot indicates availability
- **No Collectors Available**: Button shows "No Available Collectors" when none are available

### 4. User Interface Enhancements
- **Loading States**: Shows spinner while loading data
- **Refresh Button**: Manual refresh of pickup requests and collector data
- **Status Badges**: Color-coded status indicators
- **Priority Badges**: Visual priority indicators (high, medium, low)
- **Collector Count**: Badge showing number of available collectors

## How to Use

### Assigning a Collector
1. Navigate to the Admin Dashboard → Industry Pickups
2. Find a pickup request with "pending" status
3. Click on the "Assign Collector" dropdown
4. Select an available collector from the list
5. The request status will automatically update to "assigned"
6. The collector will be notified of the assignment

### Viewing Details
1. Click "View Details" on any pickup request
2. See comprehensive information including:
   - Waste type and weight
   - Location details
   - Timeline information
   - Assigned collector (if any)
3. Assign collectors directly from the detail view

### Managing Availability
- The system automatically refreshes collector availability
- Collectors can update their availability status from their dashboard
- Admin can see real-time capacity and load information

## Data Structure

### Collector Properties
- `name`: Collector's full name
- `isAvailable`: Boolean indicating availability
- `truckCapacity`: Maximum carrying capacity in kg
- `currentLoad`: Current load in kg
- `currentLocation`: GPS coordinates
- `assignedRequests`: Array of assigned pickup request IDs

### Pickup Request Properties
- `status`: Current status of the request
- `collectorId`: ID of assigned collector (if any)
- `collectorName`: Name of assigned collector (if any)
- `priority`: Request priority level
- `wasteType`: Type of waste to be collected
- `weight`: Weight in kg

## Technical Implementation

### Services Used
- `collectorService.getAvailableCollectors()`: Fetches available collectors
- `pickupService.assignCollector()`: Assigns collector to pickup request
- `pickupService.getAllPickupRequests()`: Fetches all pickup requests

### State Management
- Real-time updates when assignments are made
- Automatic refresh of collector availability
- Loading states for better user experience

## Sample Data
To test the feature, you can use the sample collector data in `/scripts/create-sample-collectors.js`. This script creates test collectors with different availability statuses and capacities.

## Best Practices
1. **Regular Monitoring**: Check available collectors regularly during peak hours
2. **Capacity Management**: Consider collector capacity when assigning heavy pickups
3. **Geographic Proximity**: Future enhancement to consider location when assigning
4. **Priority Handling**: Prioritize high-priority requests for assignment

## Future Enhancements
- Automatic assignment based on proximity and capacity
- Route optimization for collectors
- Real-time tracking integration
- Notification system for collectors
- Performance analytics and reporting
