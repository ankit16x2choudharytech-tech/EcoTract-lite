# 📋 File & Folder Status After Firebase Migration

## ✅ **STILL NEEDED** (Keep)

### Core Application
- **`src/`** - All frontend + backend code (API routes, components, lib)
  - ✅ `src/app/` - Next.js pages & API routes (all using Firestore now)
  - ✅ `src/components/` - UI components (updated with Google sign-in)
  - ✅ `src/lib/` - Utilities (firebase*.ts, firestore.ts, server-auth.ts, etc.)
- **`public/`** - Static assets (robots.txt, etc.)
- **`package.json`** - Dependencies (firebase, firebase-admin added)
- **`tailwind.config.ts`** - Tailwind styling
- **`tsconfig.json`** - TypeScript config
- **`next.config.ts`** - Next.js config
- **`postcss.config.mjs`** - PostCSS config
- **`eslint.config.mjs`** - ESLint config
- **`components.json`** - shadcn/ui config

### Documentation & Setup
- ✅ **`README.md`** - Updated with Firebase info
- ✅ **`FIREBASE_MIGRATION.md`** - Firebase setup guide
- ✅ **`GOOGLE_LOGIN_SETUP.md`** - Google OAuth setup
- ✅ **`.env.local.example`** - Firebase env vars template
- **`Caddyfile`** - Reverse proxy config (production)
- **`start-dev.sh`** - Dev startup script

### Utilities
- **`scripts/migrate-to-firestore.ts`** - Migrate SQLite → Firestore ✅ (useful if migrating old data)
- **`.gitignore`** - Git ignore rules
- **`worklog.md`** - Project notes

---

## ❌ **NO LONGER NEEDED** (Can Delete)

### Prisma/SQLite Files
- **`prisma/`** - Entire folder! Not used anymore
  - ❌ `prisma/schema.prisma` - Prisma schema (SQLite)
  - ❌ `.env` - Contains old `DATABASE_URL` for SQLite
- **`db/`** - SQLite database files (no longer used)
  - ❌ `db/custom.db` - Old database file
- **`.env.firebase.example`** - This was an interim file, superseded by `.env.local.example`

### Outdated Scripts (Need Updating)
- **`scripts/make-admin.ts`** - ⚠️ Uses old Prisma syntax (needs Firestore update)
- **`scripts/seed-badges.ts`** - ⚠️ Uses old Prisma syntax (needs Firestore update)

---

## ⚠️ **NEED VERIFICATION / UPDATES**

### API Routes to Check
Some admin routes may still reference old Prisma patterns:
- **`src/app/api/admin/`** - Check if all routes use Firestore DAL
- **`src/app/api/leaderboard/route.ts`** - May need Firestore queries instead of Prisma

### Client-Side Code
- **`src/components/eco/auth-view.tsx`** - Check if using new Google sign-in component
- **`src/lib/store.ts`** - Should work, but verify no Prisma references
- **`src/lib/api-client.ts`** - Should work, but verify auth token usage

---

## 📦 What to Keep in `.env.local`

```bash
# Firebase Admin SDK (Server-side)
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json

# Firebase JS SDK (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**DELETE from `.env`:**
- ❌ `DATABASE_URL` (old SQLite path)

---

## 🚀 Quick Cleanup Checklist

```bash
# 1. Delete Prisma folder
rm -rf prisma/

# 2. Delete old SQLite database
rm -rf db/

# 3. Delete old env file
rm .env

# 4. Delete interim Firebase example file
rm .env.firebase.example

# 5. Create/update .env.local (copy from .env.local.example)
cp .env.local.example .env.local
# Then fill in your Firebase credentials

# 6. Install dependencies
npm install

# 7. Test
npm run dev
```

---

## 📁 Final Structure (After Cleanup)

```
ecotrack-lite/
├── src/                          # ✅ Keep - All code here
├── public/                        # ✅ Keep - Static assets
├── scripts/
│   ├── migrate-to-firestore.ts  # ⚠️ Keep but update for Firestore
│   ├── make-admin.ts            # ⚠️ Keep but update for Firestore
│   └── seed-badges.ts           # ⚠️ Keep but update for Firestore
├── .env.local                    # ✅ Create - Firebase creds
├── .env.local.example            # ✅ Keep - Template
├── .env.firebase.example         # ❌ Delete - Superseded
├── .env                          # ❌ Delete - Old SQLite
├── prisma/                       # ❌ Delete - Not used
├── db/                           # ❌ Delete - SQLite db files
├── README.md                     # ✅ Keep - Updated
├── FIREBASE_MIGRATION.md         # ✅ Keep - Setup guide
├── GOOGLE_LOGIN_SETUP.md         # ✅ Keep - OAuth guide
├── package.json                  # ✅ Keep - Updated deps
├── tailwind.config.ts            # ✅ Keep
├── tsconfig.json                 # ✅ Keep
├── next.config.ts                # ✅ Keep
└── [other config files]          # ✅ Keep
```

---

## 🔧 Scripts That Need Updates

### `scripts/make-admin.ts`
**Current**: Uses `db.user.findUnique()` (Prisma)
**Need to change to**: `getUserById()` (Firestore)

### `scripts/seed-badges.ts`
**Current**: Uses `db.badgeDef.createMany()` (Prisma)
**Need to change to**: Firestore collection write

---

## 💡 Summary

| Item | Status | Action |
|------|--------|--------|
| `src/` | ✅ Needed | Keep - Updated for Firebase |
| `public/` | ✅ Needed | Keep |
| `prisma/` | ❌ Not Needed | **DELETE** |
| `db/` | ❌ Not Needed | **DELETE** |
| `.env` | ❌ Not Needed | **DELETE** |
| `.env.local` | ✅ Needed | Create with Firebase creds |
| `.env.local.example` | ✅ Needed | Keep as template |
| `.env.firebase.example` | ❌ Redundant | **DELETE** |
| Scripts (make-admin, seed-badges) | ⚠️ Partial | Keep but update for Firestore |
| `FIREBASE_MIGRATION.md` | ✅ Needed | Keep - Setup instructions |
| `GOOGLE_LOGIN_SETUP.md` | ✅ Needed | Keep - OAuth setup |
