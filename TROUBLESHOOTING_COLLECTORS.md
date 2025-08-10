# Firebase Collector Creation Error Troubleshooting Guide

## Common Issues and Solutions

### 1. Firebase Configuration Issues

**Problem**: Missing or incorrect Firebase environment variables
**Solution**: 
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Firebase project credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
3. Restart the development server

### 2. Firebase Authentication Errors

**Common Error Codes:**

- `auth/email-already-in-use`: Email is already registered
- `auth/weak-password`: Password must be at least 6 characters
- `auth/invalid-email`: Email format is invalid
- `auth/operation-not-allowed`: Email/password auth not enabled in Firebase console
- `auth/network-request-failed`: Network connectivity issues

**Solution**: The improved error handling will show specific messages for each case.

### 3. Firebase Security Rules

**Problem**: Permission denied when writing to Firestore
**Solution**: Check your `firestore.rules` file. For development, you can use:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Debugging Steps

1. **Open Browser Developer Tools** (F12)
2. **Go to Console Tab**
3. **Try creating a collector**
4. **Check for error messages**

The updated code now includes:
- ✅ Better validation for all fields
- ✅ Email format validation
- ✅ Password strength validation
- ✅ Truck capacity number validation
- ✅ Specific error messages for different Firebase error types
- ✅ Debug logging for troubleshooting

### 5. Manual Testing Commands

Open browser console and run:
```javascript
// Test Firebase connection
debugFirebaseAuth.checkFirebaseConnection()

// List all users
debugFirebaseAuth.listAllUsers()
```

### 6. Common Input Validation Issues

- **Email**: Must be valid format (user@domain.com)
- **Password**: Must be at least 6 characters
- **Phone**: Should include numbers
- **Truck Capacity**: Must be a positive number
- **Name**: Cannot be empty

### 7. Network Issues

If you see network errors:
1. Check internet connection
2. Verify Firebase project is active
3. Check if Firebase services are down (firebase.google.com/support/release-notes)

## Quick Fix Checklist

- [ ] `.env.local` file exists with Firebase credentials
- [ ] Firebase Authentication is enabled in Firebase Console
- [ ] Email/Password authentication is enabled
- [ ] Firestore security rules allow writes
- [ ] All form fields are filled correctly
- [ ] Password is at least 6 characters
- [ ] Email format is valid
- [ ] Truck capacity is a number

## If Issues Persist

1. Check browser console for detailed error messages
2. Verify Firebase project settings
3. Test with a simple email/password (test@example.com / password123)
4. Contact your Firebase project administrator
