# Firebase Setup Guide for EcoCycle Hub

## Prerequisites

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database and Authentication

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Firebase Configuration Steps

### 1. Create Firebase Project
- Go to Firebase Console
- Click "Create a project"
- Enter project name (e.g., "eco-cycle-hub")
- Continue and finish setup

### 2. Enable Authentication
- In Firebase Console, go to Authentication
- Click "Get started"
- Go to "Sign-in method" tab
- Enable "Email/Password" provider

### 3. Create Firestore Database
- In Firebase Console, go to Firestore Database
- Click "Create database"
- Choose "Start in test mode" (for development)
- Select your preferred location

### 4. Get Configuration
- Go to Project Settings (gear icon)
- Scroll down to "Your apps"
- Click "Web" icon to add a web app
- Register app with nickname "eco-cycle-hub"
- Copy the configuration values to your `.env.local` file

### 5. Firestore Security Rules (Optional for Development)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Database Collections

The app will create the following collections automatically:

### Users Collection (`users`)
- Contains user authentication and basic profile data
- Document ID: User UID from Firebase Auth

### Collector Profiles Collection (`collectorProfiles`)
- Contains detailed collector profile information
- Document ID: User UID from Firebase Auth
- Fields: name, email, phone, address, vehicle info, etc.

### Pickup Requests Collection (`pickupRequests`)
- Contains industry pickup requests
- Fields: industry info, waste type, location, status, etc.

### Products Collection (`products`)
- Contains marketplace products
- Fields: name, description, price, category, etc.

### Orders Collection (`orders`)
- Contains customer orders
- Fields: customer info, items, status, etc.

### Notifications Collection (`notifications`)
- Contains user notifications
- Fields: user ID, message, type, read status, etc.

## Testing the Integration

1. Start the development server: `npm run dev`
2. Navigate to the collector profile page: `http://localhost:3001/collector-profile`
3. If Firebase is configured correctly:
   - You should see a login prompt if not authenticated
   - Profile data will be loaded from and saved to Firestore
   - Check the browser console for any Firebase errors

## Troubleshooting

### Common Issues:

1. **Firebase config missing**: Check `.env.local` file exists and has correct values
2. **Authentication errors**: Ensure Email/Password is enabled in Firebase Auth
3. **Firestore permission errors**: Check Firestore rules allow read/write access
4. **Network errors**: Ensure your computer has internet access

### Debug Steps:

1. Check browser console for error messages
2. Verify Firebase project is active and billing is enabled (if needed)
3. Test Firebase connection in browser developer tools Network tab
4. Check if `.env.local` variables are loaded (they should start with `NEXT_PUBLIC_`)

## URL Access

Once running, access the collector dashboard at:

**Local Access:**
- `http://localhost:3001/collectordash`
- `http://localhost:3001/collector-profile`

**Network Access (from other devices on your local network):**
- Replace `localhost` with your computer's IP address
- Example: `http://192.168.1.100:3001/collectordash`
- Find your IP with: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

## Features Implemented

### Collector Profile Management
- ✅ Load profile from Firebase Firestore
- ✅ Save profile updates to Firestore
- ✅ Fallback to localStorage for offline functionality
- ✅ Real-time form validation
- ✅ Loading states and error handling
- ✅ Authentication integration

### Data Flow
1. User logs in with Firebase Auth
2. Profile data loads from Firestore collection `collectorProfiles`
3. If no profile exists, creates new document with user data
4. Updates save to Firestore and sync across devices
5. localStorage acts as backup/cache
