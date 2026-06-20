# Firebase Migration Guide

## ✅ Completed

Your EcoTrack Lite app has been **migrated from SQLite + Prisma to Firebase Auth + Firestore**!

### What Changed:

1. **Authentication**: Now uses Firebase Auth (instead of local JWT tokens)
   - `src/lib/firebaseAuth.ts` - Firebase ID token verification
   - `src/lib/server-auth.ts` - Updated to verify Firebase tokens

2. **Database**: Now uses Firestore (instead of SQLite)
   - `src/lib/firebaseAdmin.ts` - Firebase Admin SDK initializer
   - `src/lib/firestore.ts` - Firestore data access layer (DAL)
   - Collections: `users`, `users/{id}/dailyLogs`, `users/{id}/goals`, `users/{id}/badges`, `badgeDefs`

3. **API Routes Updated**:
   - `src/app/api/auth/route.ts` - Signup/login/Google auth with Firebase
   - `src/app/api/logs/route.ts` - Daily logs with Firestore storage
   - `src/app/api/goals/route.ts` - Goals management with Firestore
   - `src/lib/daily-login.ts` - Streak tracking with Firestore
   - `src/lib/badge-defs.ts` - Badge definitions from Firestore

4. **Dependencies Added**:
   - `firebase-admin` - Firebase Admin SDK
   - `ts-node` - For running migration scripts

## 🔧 Setup Steps

### 1. Create a Firebase Project

Go to [Firebase Console](https://console.firebase.google.com) and create a new project.

### 2. Enable Services

In Firebase Console:
- **Authentication** → Enable "Email/Password" and "Google" providers
- **Firestore** → Create a database in production mode (set security rules below)
- **Service Account** → Generate a new private key (JSON)

### 3. Configure Environment Variables

Add to `.env.local` (copy from `.env.local.example`):

```bash
# Firebase Admin SDK (Server-side)
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json

# Firebase JS SDK (Client-side) - Get these from Firebase Console
# Go to Project Settings → Your apps → Web app → Firebase SDK snippet
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

Or set it as an environment variable:

```bash
export FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccountKey.json
```

### 4. Install Dependencies

```bash
npm install
# or yarn install
```

### 5. Migrate Data from SQLite to Firestore

If you have existing SQLite data:

```bash
npx ts-node ./scripts/migrate-to-firestore.ts
```

This script reads all data from SQLite and writes it to Firestore.

### 6. Set Firestore Security Rules

Go to Firestore Console → Rules tab, and set:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Subcollections: dailyLogs, goals, badges
      match /dailyLogs/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      match /goals/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      match /badges/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Badge definitions are read-only for users
    match /badgeDefs/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

### 7. Test Auth & Firestore

```bash
npm run dev
```

Visit http://localhost:3000 and test signup/login.

## 🔐 Google Sign-In Setup (Real OAuth)

### Enable Google Provider

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Click **Google** and enable it
3. Set up OAuth consent screen:
   - Add your app name, logo, support email
   - Add scopes: email, profile, openid
4. Add authorized redirect URIs:
   - `http://localhost:3000` (dev)
   - `https://yourdomain.com` (production)

### Use Google Sign-In Button

In your auth component:

```tsx
import { GoogleSignInButton } from '@/components/eco/google-sign-in'

export function LoginPage() {
  const handleSuccess = (user: any, token: string) => {
    console.log('Logged in as:', user.email)
    // Redirect to dashboard or update app state
  }

  return (
    <div>
      <h1>Sign In</h1>
      <GoogleSignInButton onSuccess={handleSuccess} />
    </div>
  )
}
```

### How It Works

1. **Client clicks "Sign in with Google"** → Firebase popup opens
2. **User authenticates with Google** → Firebase returns ID token
3. **Token sent to backend** (`/api/auth` with `action: "google"`)
4. **Backend verifies token** → Creates/updates Firestore profile
5. **Returns user data + token** → Client stores in localStorage
6. **User logged in!** ✅

### Test Google Sign-In

1. Make sure `NEXT_PUBLIC_FIREBASE_*` env vars are set
2. Run `npm run dev`
3. Click "Sign in with Google" button
4. Verify token in browser console: `localStorage.getItem('firebaseToken')`

## 📝 API Endpoint Changes

### Auth (`/api/auth`)

**Signup**:
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"signup","email":"user@example.com","password":"password","name":"John"}'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"user@example.com","password":"password"}'
```

Returns: `{ user: {...}, token: "firebase_id_token" }`

### Daily Logs (`/api/logs`)

**Get Logs** (requires Authorization header):
```bash
curl -X GET http://localhost:3000/api/logs?days=60 \
  -H "Authorization: Bearer $TOKEN"
```

**Post Log**:
```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"date":"2024-01-15","transportKm":10,"acHours":2,...}'
```

### Goals (`/api/goals`)

Same authorization pattern as logs.

## 🗂️ Firestore Collections Schema

```
/users/{userId}
  - id, email, name, xp, streak, lastActiveDate, onboarded, isAdmin, googleAuth, createdAt, ...
  
  /dailyLogs/{logId}
    - date, transportMode, transportKm, acHours, fanHours, ..., totalCarbon, createdAt
  
  /goals/{goalId}
    - title, description, type, target, progress, completed, xp, createdAt
  
  /badges/{badgeId}
    - name, description, earnedAt, badgeDefId

/badgeDefs/{defId}
  - name, description, icon, criteria, threshold, isDefault, createdAt
```

## ⚠️ What Still Needs Work

- [ ] Admin routes (`/api/admin/**`) — need to be updated to use Firestore
- [ ] Leaderboard (`/api/leaderboard`) — need to use Firestore queries
- [ ] AI endpoints (`/api/ai/**`) — need to use Firestore for context
- [ ] Profile routes — need to use Firestore
- [ ] Client-side SDK — should use Firebase JS SDK instead of local JWT

## 🚀 Next Steps

1. Update remaining API routes to use Firestore DAL
2. Set up Firebase JS SDK in client components for real ID token generation
3. Remove Prisma from the project (can keep for reference)
4. Test all endpoints with Firebase Auth tokens

## 📚 Resources

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth REST API](https://firebase.google.com/docs/reference/rest/auth)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
