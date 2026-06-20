# 🌱 EcoTrack Lite

> **Small Daily Actions. Big Climate Impact.**

A 100% free, AI-powered carbon footprint tracker that helps you measure your emissions, understand which habits contribute most to CO₂, receive personalized AI recommendations, and build lasting sustainable habits through gamification.

![Tech Stack](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4) ![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFA500) ![License](https://img.shields.io/badge/License-MIT-green)

> **✨ Now with Firebase!** This project has been migrated from SQLite + Prisma to Firebase Auth + Firestore for better scalability. See [FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md) and [GOOGLE_LOGIN_SETUP.md](./GOOGLE_LOGIN_SETUP.md) for setup instructions.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Firestore Collections](#-firestore-collections)
- [Carbon Calculation Logic](#-carbon-calculation-logic)
- [Gamification](#-gamification)
- [AI Integration](#-ai-integration)
- [Admin Panel](#-admin-panel)
- [Authentication](#-authentication)
- [API Reference](#-api-reference)
- [Scripts](#-scripts)
- [Environment Variables](#-environment-variables)
- [Additional Documentation](#-additional-documentation)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🌍 Overview

Most people want to reduce their carbon footprint but face several challenges:

- They don't know which daily activities generate the most CO₂.
- Existing carbon calculators are one-time tools with no ongoing tracking.
- Many solutions require paid subscriptions or IoT devices.
- Users rarely receive personalized recommendations.
- There's little motivation to maintain eco-friendly habits.

**EcoTrack Lite** solves this by providing a completely free, AI-powered platform to **measure, understand, track, and improve** your carbon footprint — all wrapped in a gamified experience that keeps you motivated.

### Vision

Create a 100% free AI-powered platform that helps users:

1. **Measure** their carbon footprint
2. **Understand** which habits contribute most to emissions
3. **Receive** personalized suggestions powered by AI
4. **Track** progress over time (daily, weekly, monthly)
5. **Build** long-term sustainable habits through gamification

---

## ✨ Features

### 👤 User Features

- **📊 Dashboard** — Real-time stats: today's emissions, weekly/monthly totals, carbon score, streak, and a 14-day emission trend chart with category breakdown pie chart.
- **📝 Daily Activity Logger** — Track transport (7 modes), electricity (5 device types), food (3 diet types), and waste (items + recycling/composting) with a live carbon preview.
- **🤖 AI Insights** — 5 personalized, AI-generated recommendations with estimated monthly CO₂ savings, plus a weekly AI report (generated every Sunday).
- **🎯 Goals** — Set sustainable goals (5 templates + custom), track progress, earn XP on completion.
- **🏆 Badges** — Unlock achievements (Green Starter → Earth Hero) as you build eco-habits.
- **🔥 Streak System** — Daily login + activity logging keeps your momentum going with milestone rewards (7/30/100 days).
- **🏅 Leaderboard** — Compete with the community on XP, longest streak, lowest emissions, and biggest improvement.
- **👤 Profile & Settings** — Manage personal info, lifestyle preferences, theme (light/dark/system), and notifications.

### 🛡️ Admin Features

- **📈 Platform Overview** — Total users, logs, CO₂ tracked, goals, badges, active users, new signups, 14-day trend charts, top emitters.
- **👥 User Management** — Search/filter users, grant XP, reset streaks, toggle admin status, toggle onboarding, delete accounts, view full user details.
- **🏆 Badge Management** — Create custom badges with 4 criteria types (manual / logged days / streak / total XP), 18 icon choices, grant badges to users manually, delete custom badges.
- **📄 Activity Logs** — View all logs across users, filter by date range, delete any log.
- **🎯 Goals Overview** — Platform-wide goal stats, completion rates by type, full goals table.
- **🏅 Badges Overview** — Badge distribution, chronological awards log.

### 🔐 Authentication

- **Email/Password** signup & login with Firebase Auth.
- **Google Login** — Real OAuth 2.0 popup flow via Firebase (Google account chooser + Firebase integration).
- **Session persistence** via Firebase ID token in localStorage.
- **Admin-protected routes** with `requireAdmin()` guard.
- See [GOOGLE_LOGIN_SETUP.md](./GOOGLE_LOGIN_SETUP.md) for real Google login setup.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui (New York style) |
| **UI Components** | shadcn/ui + Lucide icons + Framer Motion |
| **Backend Database** | Firebase Firestore (NoSQL) |
| **Authentication** | Firebase Auth (Email/Password + Google OAuth) |
| **Admin SDK** | Firebase Admin SDK (Node.js server-side) |
| **Client SDK** | Firebase JS SDK (client-side auth) |
| **State Management** | Zustand (client) |
| **Charts** | Recharts |
| **AI** | z-ai-web-dev-sdk (LLM for recommendations & weekly reports) |
| **Notifications** | Sonner (toasts) |
| **Package Manager** | Bun |
| **Process Manager** | PM2 (for dev server persistence) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/) 1.0+
- A [Firebase Project](https://console.firebase.google.com)
- Firebase Firestore enabled
- Firebase Authentication enabled (Email/Password + Google provider)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ecotrack-lite

# Install dependencies
bun install
# or npm install

# Set up Firebase (see FIREBASE_MIGRATION.md for detailed setup)
# 1. Create .env.local with Firebase credentials
# 2. Ensure Firestore database is created in Firebase Console
# 3. Enable Authentication (Email/Password + Google)
# 4. Download service account key JSON

# (Optional) Migrate existing SQLite data to Firestore
bun run migrate:firestore

# (Optional) Seed demo data
curl -X POST http://localhost:3000/api/seed
```

### Development

```bash
# Make sure .env.local is configured with Firebase credentials
# See .env.local.example for required variables

# Start the dev server (port 3000)
bun run dev

# Or with PM2 for persistence
npx pm2 start ./node_modules/.bin/next --name ecotrack -- dev -p 3000
npx pm2 logs ecotrack
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**For real Google login setup**, see [GOOGLE_LOGIN_SETUP.md](./GOOGLE_LOGIN_SETUP.md).

### Production

```bash
bun run build
bun run start
```

---

## 📁 Project Structure

```
ecotrack-lite/
├── scripts/
│   ├── migrate-to-firestore.ts    # Migrate data from SQLite to Firestore
│   ├── make-admin.ts              # Create/promote admin account
│   └── seed-badges.ts            # Seed default badge definitions
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main page (view router: landing/auth/onboarding/app)
│   │   ├── layout.tsx            # Root layout with Sonner Toaster
│   │   ├── globals.css           # Tailwind + EcoTrack green theme
│   │   └── api/
│   │       ├── auth/route.ts                 # Signup, login, Google login
│   │       ├── profile/route.ts              # Get/update profile + daily login touch
│   │       ├── logs/route.ts                 # GET/POST activity logs (+XP +streak +badges)
│   │       ├── logs/[date]/route.ts          # DELETE log by date
│   │       ├── goals/route.ts                # GET/POST/DELETE goals
│   │       ├── goals/[id]/route.ts           # PATCH (increment/complete/reset) goal
│   │       ├── badges/route.ts               # GET all badge defs (earned + locked)
│   │       ├── leaderboard/route.ts          # GET ranked leaderboard
│   │       ├── ai/
│   │       │   ├── recommendations/route.ts  # POST → 5 AI tips (LLM)
│   │       │   └── weekly-report/route.ts    # POST → AI weekly summary
│   │       ├── seed/route.ts                 # Seed demo users + logs
│   │       └── admin/                        # Admin-only API (requireAdmin guard)
│   │           ├── stats/route.ts            # Platform analytics
│   │           ├── users/route.ts            # List users
│   │           ├── users/[id]/route.ts       # GET/PATCH/DELETE user
│   │           ├── users/[id]/grant-badge/   # Manually grant badge
│   │           ├── logs/route.ts             # All logs across users
│   │           ├── logs/[id]/route.ts        # Delete any log
│   │           ├── goals/route.ts            # All goals
│   │           ├── badges/route.ts           # All badge awards
│   │           └── badge-defs/               # CRUD badge definitions
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (pre-installed)
│   │   └── eco/
│   │       ├── landing.tsx       # Marketing landing page
│   │       ├── auth-view.tsx     # Login/signup + Google OAuth modal
│   │       ├── onboarding.tsx    # 4-step lifestyle questionnaire
│   │       ├── app-shell.tsx     # Authenticated layout (sidebar + topbar)
│   │       ├── dashboard.tsx     # Stats + charts + quick actions
│   │       ├── log-activity.tsx  # Daily activity logger form
│   │       ├── ai-insights.tsx   # AI recommendations + weekly report
│   │       ├── goals.tsx         # Goals management
│   │       ├── badges.tsx        # User badges grid
│   │       ├── leaderboard.tsx   # Community rankings
│   │       ├── profile.tsx       # Profile editor
│   │       ├── settings.tsx      # Theme + notifications + account
│   │       ├── admin-panel.tsx   # Admin shell (5 tabs)
│   │       ├── admin/            # Overview, Users, Logs, Goals, Badges
│   │       ├── brand.tsx         # Logo + wordmark
│   │       └── footer.tsx        # Footer + legal modals (Privacy/Terms/Cookies/Contact)
│   └── lib/
│       ├── firebaseAdmin.ts       # Firebase Admin SDK initializer (server-side)
│       ├── firebaseClient.ts      # Firebase Client SDK (client-side auth)
│       ├── firebaseAuth.ts        # Firebase token verification helpers
│       ├── firestore.ts           # Firestore DAL (CRUD operations)
│       ├── server-auth.ts         # Auth helpers + requireAdmin guard (Firebase)
│       ├── types.ts              # Shared TypeScript types
│       ├── carbon.ts             # Emission factors + XP rules + date helpers
│       ├── badge-defs.ts         # Badge definition evaluation logic (Firestore)
│       ├── daily-login.ts        # Streak + daily-login XP helper (Firestore)
│       ├── stats.ts              # Dashboard stat computation
│       ├── store.ts              # Zustand store (session + view + cache)
│       └── api-client.ts         # Typed API client (all endpoints)
├── prisma/schema.prisma
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## 🗄️ Firestore Collections

### Collection: `users`

Document ID: Firebase Auth UID

```json
{
  "id": "user_uid",
  "email": "user@example.com",
  "name": "John Doe",
  "googleAuth": false,
  "age": 25,
  "country": "India",
  "city": "Delhi",
  "occupation": "Engineer",
  "diet": "veg|vegan|nonveg",
  "vehicle": "car|bike|bus|metro|train|walking|cycling|none",
  "xp": 1250,
  "streak": 15,
  "lastActiveDate": "2024-01-15",
  "onboarded": true,
  "isAdmin": false,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

**Subcollections:**

#### `users/{userId}/dailyLogs`
Activity logs with pre-calculated carbon emissions:
```json
{
  "date": "2024-01-15",
  "transportMode": "car",
  "transportKm": 15,
  "acHours": 2,
  "fanHours": 4,
  "lightHours": 8,
  "laptopHours": 6,
  "tvHours": 2,
  "vegMeals": 2,
  "veganMeals": 0,
  "nonVegMeals": 1,
  "plasticBags": 1,
  "glassItems": 0,
  "paperItems": 2,
  "recycling": true,
  "composting": false,
  "transportCarbon": 2.88,
  "electricityCarbon": 1.50,
  "foodCarbon": 3.0,
  "wasteCarbon": 0.20,
  "totalCarbon": 7.58,
  "createdAt": "2024-01-15T20:30:00Z"
}
```

#### `users/{userId}/goals`
User-set sustainability targets:
```json
{
  "title": "Cycle to work",
  "description": "Cycle 3 days per week",
  "type": "bicycle",
  "target": 30,
  "progress": 8,
  "completed": false,
  "xp": 100,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

#### `users/{userId}/badges`
Earned badges:
```json
{
  "name": "Green Starter",
  "description": "Logged 5 days",
  "earnedAt": "2024-01-06T10:00:00Z",
  "badgeDefId": "badge_def_id"
}
```

### Collection: `badgeDefs`

Badge definition templates:
```json
{
  "name": "Green Starter",
  "description": "Complete your first 5 logs",
  "icon": "Sprout",
  "criteria": "loggedDays|streak|totalXp|manual",
  "threshold": 5,
  "isDefault": true,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

**Key Differences from Prisma/SQLite:**
- No explicit relations; use `userId` as document ID + subcollections
- No need for explicit foreign keys
- Real-time updates possible with Firestore listeners
- Better scalability for user-specific data

See [FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md) for migration details.

---

## 🧮 Carbon Calculation Logic

All emission factors are based on public datasets (no paid APIs):

### Transport (kg CO₂ per km)

| Mode | Factor |
|------|--------|
| Car | 0.192 |
| Bike | 0.103 |
| Bus | 0.089 |
| Metro | 0.041 |
| Train | 0.041 |
| Walking | 0 |
| Cycling | 0 |

### Electricity (kg CO₂ per hour)

Based on average device wattage × India grid emission factor (~0.71 kg CO₂/kWh):

| Device | Factor |
|--------|--------|
| AC (1.5 kW) | 1.065 |
| Fan (75W) | 0.053 |
| Light (10W LED) | 0.007 |
| Laptop (50W) | 0.036 |
| TV (100W) | 0.071 |

### Food (kg CO₂ per meal)

| Diet | Factor |
|------|--------|
| Vegetarian | 1.0 |
| Vegan | 0.6 |
| Non-Vegetarian | 3.0 |

### Waste (kg CO₂ per item/action)

| Item | Factor |
|------|--------|
| Plastic bag | +0.1 |
| Glass item | +0.05 |
| Paper item | +0.03 |
| Recycling | −0.5 (credit) |
| Composting | −0.3 (credit) |

### Carbon Score Bands

| Daily kg CO₂ | Band |
|-------------|------|
| 0–20 | Excellent 🟢 |
| 21–40 | Good 🟡 |
| 41–60 | Average 🟠 |
| 61+ | Needs Improvement 🔴 |

---

## 🎮 Gamification

### XP Rewards

| Action | XP |
|--------|-----|
| Daily login (first of day) | +10 |
| Log new activity | +20 |
| Update existing activity | +5 |
| Complete a goal | +50 (goal XP) |
| 7-day streak milestone | +50 |
| 30-day streak milestone | +200 |
| Weekly streak (every 7 days) | +100 |

### Streak System

- Login + activity logging keeps your streak alive.
- Streak resets if you miss a day.
- Milestone rewards at 7, 30, and 100 days.

### Badges (Default)

| Badge | Criteria |
|-------|----------|
| 🌱 Green Starter | Log your first activity |
| 🧭 Eco Explorer | Log 5 daily activities |
| ⚔️ Carbon Fighter | Log 25 daily activities |
| 🛡️ Planet Protector | Reach a 30-day streak |
| 🏅 Earth Hero | Keep a day under 5 kg CO₂ |

### Custom Badges (Admin-created)

Admins can create unlimited custom badges with 4 criteria types:
- **Manual** — Admin grants manually
- **Logged Days** — Auto-award at N logged days
- **Streak** — Auto-award at N-day streak
- **Total XP** — Auto-award at N XP

---

## 🤖 AI Integration

EcoTrack Lite uses the **z-ai-web-dev-sdk** (LLM) for two AI features:

### 1. AI Recommendations

`POST /api/ai/recommendations`

Analyzes the user's last 7 days of activity data and generates **5 personalized, actionable recommendations** with estimated monthly CO₂ savings. Includes a motivational message. Falls back to rule-based recommendations if the LLM is unavailable.

### 2. AI Weekly Report

`POST /api/ai/weekly-report`

Generates a **Sunday sustainability summary** including:
- Weekly total carbon
- Top emission source
- Biggest improvement vs last week
- Next week's goal
- A motivating summary paragraph

Both features send anonymized, aggregated data to the LLM — no personally identifiable information is shared.

---

## 🛡️ Admin Panel

The admin panel is accessible only to users with `isAdmin: true`. Access it via the **"Admin Panel"** button in the sidebar or the **👑 Admin** pill in the top bar.

### Admin Tabs

1. **Overview** — Platform-wide analytics: 8 stat cards, 14-day CO₂ trend, emission sources pie, daily logging bar chart, top 5 emitters.
2. **Users** — Full CRUD: search, filter (all/admins/users), grant XP, reset streak, toggle admin, delete account, view details dialog, grant badges.
3. **Activity Logs** — View all logs across users, filter by 7/30/60/90 days, delete any entry.
4. **Goals** — Platform-wide goal stats, completion rates by type, full goals table.
5. **Badges** — Create/delete custom badge definitions, view distribution, view awards log.

### Security

- All admin API routes are guarded by `requireAdmin()` (returns 401 if not logged in, 403 if not admin).
- Self-protection: admins cannot revoke their own admin status or delete their own account.
- Default badges cannot be deleted.

---

## 🔐 Authentication

### Email/Password

- Signup: `POST /api/auth` with `{ action: "signup", name, email, password }`
- Backend creates user in Firebase Auth + stores profile in Firestore
- Returns Firebase ID token + user profile
- Auth tokens stored in localStorage

### Google Login (Real OAuth)

- **Client-side**: `src/components/eco/google-sign-in.tsx` component handles OAuth popup
- User authenticates with Google → Firebase returns ID token
- **Server-side**: `POST /api/auth` with `{ action: "google", idToken, email, name }`
- Backend verifies ID token with Firebase Admin SDK
- Creates/updates user profile in Firestore
- Returns Firebase ID token + user profile
- See [GOOGLE_LOGIN_SETUP.md](./GOOGLE_LOGIN_SETUP.md) for complete setup

### Daily Login Touch

On every login (via `GET /api/profile` triggered on app load) and every activity log save, the `touchDailyLogin()` helper:
- Updates `lastActiveDate` to today in Firestore
- Increments streak (or resets to 1 if a day was missed)
- Awards +10 daily-login XP (+ milestone bonuses)
- Is idempotent (safe to call multiple times per day)

---

## 📡 API Reference

### Public Endpoints (require auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth` | Signup / login / Google login |
| GET | `/api/profile` | Get current user (+ daily login touch) |
| PUT | `/api/profile` | Update profile |
| GET | `/api/logs?days=N` | Get recent activity logs |
| POST | `/api/logs` | Save/update activity log (+XP +streak +badges) |
| DELETE | `/api/logs/[date]` | Delete log by date |
| GET | `/api/goals` | Get user goals + templates |
| POST | `/api/goals` | Create goal |
| PATCH | `/api/goals/[id]` | Increment/complete/reset goal |
| DELETE | `/api/goals/[id]` | Delete goal |
| GET | `/api/badges` | Get all badge defs (earned + locked) |
| GET | `/api/leaderboard?sort=` | Get ranked leaderboard |
| POST | `/api/ai/recommendations` | Generate 5 AI tips |
| POST | `/api/ai/weekly-report` | Generate AI weekly report |
| POST | `/api/seed` | Seed demo data |

### Admin Endpoints (require admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform analytics |
| GET | `/api/admin/users?q=&role=` | List/search users |
| GET | `/api/admin/users/[id]` | User detail (logs/goals/badges) |
| PATCH | `/api/admin/users/[id]` | grantXp / resetStreak / toggleAdmin / etc. |
| DELETE | `/api/admin/users/[id]` | Delete user |
| POST | `/api/admin/users/[id]/grant-badge` | Grant badge to user |
| GET | `/api/admin/logs?days=&userId=` | All logs across users |
| DELETE | `/api/admin/logs/[id]` | Delete any log |
| GET | `/api/admin/goals` | All goals + stats |
| GET | `/api/admin/badges` | All badge awards + stats |
| GET | `/api/admin/badge-defs` | All badge definitions |
| POST | `/api/admin/badge-defs` | Create custom badge |
| DELETE | `/api/admin/badge-defs/[id]` | Delete custom badge |

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (port 3000) |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run migrate:firestore` | Migrate data from SQLite to Firestore |
| `bun scripts/make-admin.ts` | Create/promote admin account |
| `bun scripts/seed-badges.ts` | Seed default badge definitions (to Firestore) |

---

## 🔧 Environment Variables

Create a `.env.local` file in the root (copy from `.env.local.example`):

```env
# Firebase Admin SDK (Server-side)
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json

# Firebase JS SDK (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Getting Firebase Config:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Project Settings
3. Under "Your apps" → Web app → Copy config
4. Download service account key JSON

The AI features use `z-ai-web-dev-sdk` which is pre-configured — no additional API keys needed in this environment.

---

## � Additional Documentation

- **[FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md)** — Complete Firebase setup and migration guide
- **[GOOGLE_LOGIN_SETUP.md](./GOOGLE_LOGIN_SETUP.md)** — Real OAuth 2.0 Google login setup

---

## 🐛 Troubleshooting

### Firebase Issues

**"Could not verify ID token"**
- Ensure `FIREBASE_SERVICE_ACCOUNT` path is correct
- Verify service account JSON has valid format
- Check Firestore is enabled in Firebase Console

**"Google sign-in popup not opening"**
- Verify `NEXT_PUBLIC_FIREBASE_*` env vars are set
- Check Google provider is enabled in Firebase Console
- Verify authorized redirect URIs include `localhost:3000` (for dev)

**"User profile not created after login"**
- Check Firestore database exists
- Verify security rules allow user writes
- Check browser console for API errors

See [GOOGLE_LOGIN_SETUP.md](./GOOGLE_LOGIN_SETUP.md#-troubleshooting) for more troubleshooting.

---

## 👥 Demo Data

 
### Admin Account

| Email | Password | Description |
|-------|----------|-------------|
| `ankit16x2techbusiness@gmail.com"
` | `12345678` | Full admin access |

### Google Login

Use the "Continue with Google" button on the auth page. Two demo Google accounts are pre-loaded:
 

You can also "Use another account" to sign in with any custom Google-style email.

---

## 🗺️ Roadmap

### Future Scope

- 📷 **Receipt scanning with OCR** to estimate shopping emissions
- ⌚ **Smartwatch/fitness integration** for automatic walking and cycling logs
- ⚡ **Smart electricity meter integration** for real-time energy tracking
- 👨‍👩‍👧‍👦 **Family/team accounts** with shared sustainability goals
- 🌳 **Carbon offset recommendations** and local volunteering opportunities
- 🌐 **Multi-language support**
- 📊 **Advanced analytics** with year-over-year comparisons
- 🔔 **Push notifications** for streak reminders

---

## 📄 License

This project is licensed under the **MIT License** — it's 100% free to use, modify, and distribute.

---

## 💚 Acknowledgements

- Emission factors based on public datasets (EPA, IPCC, India grid data).
- UI built with [shadcn/ui](https://ui.shadcn.com/) and [Lucide icons](https://lucide.dev/).
- AI powered by [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk).
- Charts by [Recharts](https://recharts.org/).
- Animations by [Framer Motion](https://www.framer.com/motion/).

---

<div align="center">

**Built with 💚 for a greener planet**

Small Daily Actions · Big Climate Impact 🌱

</div>
