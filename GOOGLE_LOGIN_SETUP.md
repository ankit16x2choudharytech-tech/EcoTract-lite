# Real Google Login Setup - Quick Reference

## ✅ What's Done

- ✅ `src/lib/firebaseClient.ts` - Firebase JS SDK (client-side)
- ✅ `src/components/eco/google-sign-in.tsx` - Google sign-in button component
- ✅ `src/app/api/auth/route.ts` - Updated to verify real Google ID tokens
- ✅ `.env.local.example` - Environment variables template

## 🚀 Steps to Activate

### 1. Get Firebase Config from Console

1. Go to https://console.firebase.google.com
2. Select your project
3. Click **Project Settings** (gear icon) → **Your apps**
4. Find your **Web app** (or create if not exists)
5. Copy the config:

```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}
```

### 2. Enable Google Sign-In

In Firebase Console:
1. Go to **Authentication** → **Sign-in method**
2. Click **Google** → **Enable** → Save
3. Set up OAuth consent screen (if not done)

### 3. Add Environment Variables

Create `.env.local` (copy from `.env.local.example`):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Use Google Sign-In Button

In your login/auth component:

```tsx
'use client'

import { GoogleSignInButton } from '@/components/eco/google-sign-in'

export default function AuthPage() {
  return (
    <div>
      <h1>Sign In to EcoTrack</h1>
      <GoogleSignInButton onSuccess={(user, token) => {
        console.log('Logged in:', user.email)
        // Token is automatically stored in localStorage
      }} />
    </div>
  )
}
```

## 🔄 How It Works

### Client Flow:
1. User clicks "Sign in with Google" button
2. Firebase popup opens (Google OAuth)
3. User logs in with Google account
4. Firebase returns ID token

### Server Flow:
1. Frontend sends ID token to `/api/auth`
2. Backend verifies token with Firebase Admin SDK
3. Backend creates/updates user profile in Firestore
4. Backend returns user data + token to frontend

## 📋 API Endpoint

**POST `/api/auth`**

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "google",
    "idToken": "FIREBASE_ID_TOKEN_FROM_CLIENT",
    "email": "user@gmail.com",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "user": {
    "id": "uid...",
    "email": "user@gmail.com",
    "name": "John Doe",
    "xp": 0,
    "streak": 0,
    ...
  },
  "token": "FIREBASE_ID_TOKEN"
}
```

## ✨ Token Storage

After Google sign-in, the component automatically stores:
- Token in `localStorage.getItem('firebaseToken')`
- User in `localStorage.getItem('user')`

Use these for subsequent API calls:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/logs?days=30
```

## 🐛 Troubleshooting

### "CORS error" or "Config not loaded"
- Check `NEXT_PUBLIC_FIREBASE_*` env vars are set
- Verify values match Firebase Console
- Restart dev server after env changes

### "Invalid ID token"
- Make sure Google provider is enabled in Firebase Console
- Check OAuth consent screen is configured
- Verify authorized redirect URIs include localhost:3000

### "User not found" error
- First Google sign-in creates profile automatically
- Subsequent logins retrieve existing profile
- Check Firestore `users` collection

## 📚 Files Reference

- **Client Setup**: `src/lib/firebaseClient.ts`
- **Sign-In Component**: `src/components/eco/google-sign-in.tsx`
- **Backend Auth**: `src/app/api/auth/route.ts`
- **Firestore DAL**: `src/lib/firestore.ts`
- **Environment**: `.env.local.example`
