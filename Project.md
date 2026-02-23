# Dating App - Monorepo Handoff Document

## Project Overview

Building a **mobile-first PWA dating app** with transparent matching, compatibility-based discovery, and anti-manipulation mechanics. The monorepo contains three Next.js apps sharing a common Supabase backend.

**Core Differentiators:**
- Voice intros (optional but visibility-boosted 3x)
- Compatibility quiz filtering discovery
- Smart visibility algorithm (prevents winner-take-all dynamics)
- Anti-ghosting accountability (response rate visible)
- Transparent algorithms (no fake profiles, no artificial scarcity)
- Honest monetization (no dark patterns)

---

## Monorepo Structure

```
dating-app/
├── apps/
│   ├── web/                       # User-facing PWA (mobile-first)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── signup/
│   │   │   │   │   └── onboarding/
│   │   │   │   ├── (app)/
│   │   │   │   │   ├── discover/
│   │   │   │   │   ├── matches/
│   │   │   │   │   ├── chat/[id]/
│   │   │   │   │   ├── profile/[id]/
│   │   │   │   │   └── settings/
│   │   │   │   └── api/
│   │   │   ├── components/
│   │   │   ├── styles/
│   │   │   └── public/
│   │   │       └── manifest.json    # PWA manifest
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── admin/                     # Admin panel (desktop-optimized)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   └── login/
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── moderation/
│   │   │   │   │   │   ├── photos/
│   │   │   │   │   │   └── voice-intros/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── subscriptions/
│   │   │   │   │   └── analytics/
│   │   │   │   └── api/
│   │   │   └── components/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── landing/                   # Marketing site
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx       # Home/hero
│       │   │   ├── features/
│       │   │   ├── pricing/
│       │   │   ├── about/
│       │   │   └── faq/
│       │   └── components/
│       ├── package.json
│       └── next.config.js
│
├── packages/
│   └── database/                  # Shared Supabase logic
│       ├── src/
│       │   ├── client/
│       │   │   ├── index.ts       # Supabase client
│       │   │   └── server.ts      # Server client
│       │   ├── types/
│       │   │   ├── database.ts    # Generated types
│       │   │   ├── profile.ts
│       │   │   ├── match.ts
│       │   │   └── message.ts
│       │   ├── api/               # API wrappers
│       │   │   ├── auth.ts
│       │   │   ├── profiles.ts
│       │   │   ├── photos.ts
│       │   │   ├── voice-intros.ts
│       │   │   ├── swipes.ts
│       │   │   ├── matches.ts
│       │   │   ├── messages.ts
│       │   │   └── subscriptions.ts
│       │   ├── services/          # Business logic
│       │   │   ├── matching.ts
│       │   │   ├── discovery.ts
│       │   │   ├── visibility.ts
│       │   │   ├── moderation.ts
│       │   │   └── geolocation.ts
│       │   └── utils/             # Shared utilities
│       │       ├── distance.ts
│       │       ├── age.ts
│       │       ├── validation.ts
│       │       └── formatters.ts
│       ├── package.json
│       └── tsconfig.json
│
├── supabase/                      # Supabase config
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── seed.sql
│   └── config.toml
│
├── package.json                   # Root package.json
├── turbo.json                     # Turborepo config
└── pnpm-workspace.yaml           # Workspace config
```

---

## Tech Stack

### Core Technologies
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Monorepo:** Turborepo
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS
- **Backend/DB:** Supabase (Postgres + Auth + Storage + Realtime)
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Animations:** Framer Motion (swipe deck)
- **Forms:** React Hook Form + Zod
- **State:** Zustand
- **Data Fetching:** TanStack Query
- **Payments:** Stripe

### External Services
- **Phone Verification:** Twilio Verify API
- **Photo Moderation:** AWS Rekognition
- **Voice Storage:** Supabase Storage
- **Hosting:** Vercel (all 3 apps)

---

## Initial Setup

### 1. Create Turborepo

```bash
npx create-turbo@latest dating-app
cd dating-app
```

Select:
- Package manager: **pnpm**
- TypeScript: **yes**

### 2. Clean Up Generated Files

```bash
# Remove example apps
rm -rf apps/web apps/docs

# Create our app structure
mkdir -p apps/web apps/admin apps/landing
mkdir -p packages/database
```

### 3. Root Configuration Files

**package.json (root):**
```json
{
  "name": "dating-app",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "latest"
  },
  "packageManager": "pnpm@8.0.0",
  "engines": {
    "node": ">=18"
  }
}
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**pnpm-workspace.yaml:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## Package Setup

### Database Package (packages/database)

**package.json:**
```json
{
  "name": "@dating-app/database",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint .",
    "generate-types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.0.10",
    "zod": "^3.22.4",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3"
  }
}
```

**src/index.ts:**
```typescript
// Export everything from the package
export * from './client'
export * from './types'
export * from './api'
export * from './services'
export * from './utils'
```

**src/client/index.ts:**
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/database'

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = createClient()
```

**src/client/server.ts:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../types/database'

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

---

## App Configurations

### Web App (apps/web)

**package.json:**
```json
{
  "name": "web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@dating-app/database": "workspace:*",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/ssr": "^0.0.10",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.17.9",
    "framer-motion": "^10.18.0",
    "react-hook-form": "^7.49.3",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "lucide-react": "^0.303.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "react-h5-audio-player": "^3.9.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dating-app/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
```

**PWA Configuration (public/manifest.json):**
```json
{
  "name": "Dating App",
  "short_name": "Dating",
  "description": "Find meaningful connections based on real compatibility",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Add to layout.tsx:**
```typescript
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dating App',
  },
}
```

### Admin App (apps/admin)

**package.json:**
```json
{
  "name": "admin",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@dating-app/database": "workspace:*",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/ssr": "^0.0.10",
    "@tanstack/react-query": "^5.17.9",
    "recharts": "^2.10.3",
    "lucide-react": "^0.303.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

### Landing App (apps/landing)

**package.json:**
```json
{
  "name": "landing",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.18.0",
    "lucide-react": "^0.303.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

---

## Environment Variables

**Root .env.local (shared):**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid

# AWS (Photo Moderation)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# App URLs
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_LANDING_URL=http://localhost:3002
```

Each app can have its own `.env.local` for app-specific vars, but shared vars go in root.

---

## MVP Feature Scope (8-12 Weeks)

### Web App Features

**Auth & Onboarding:**
- [ ] Phone verification (Twilio OTP)
- [ ] Email/password or Google OAuth
- [ ] Multi-step profile wizard (name, age, photos, bio, voice intro, location)
- [ ] Profile completeness gate

**Profile:**
- [ ] Profile view page
- [ ] Photo gallery (2-6 photos)
- [ ] Voice intro player
- [ ] Edit profile

**Discovery:**
- [ ] Swipe deck UI (like/pass with Framer Motion)
- [ ] One super like per day
- [ ] Distance filter (5-50 miles)
- [ ] Age filter
- [ ] Activity filter (last 14 days only)
- [ ] Match celebration screen

**Matching:**
- [ ] Mutual match detection (auto via DB trigger)
- [ ] Match list

**Chat:**
- [ ] Real-time messaging (Supabase Realtime)
- [ ] Typing indicators
- [ ] Unmatch button

**Safety:**
- [ ] Report user
- [ ] Block user
- [ ] Photo moderation (AWS Rekognition on upload)

**Monetization:**
- [ ] Free tier: 20 swipes/day
- [ ] Premium: unlimited swipes + 5 super likes/day ($12.99/mo)
- [ ] Stripe checkout + customer portal

**Settings:**
- [ ] Edit profile
- [ ] Change filters
- [ ] Delete account

### Admin App Features

**Auth:**
- [ ] Admin login (separate from user auth)
- [ ] Role-based access control

**Moderation Queues:**
- [ ] Photo review queue (pending approval)
- [ ] Voice intro review queue
- [ ] Approve/reject with reason

**User Management:**
- [ ] Search users
- [ ] View profiles
- [ ] Suspend/ban accounts
- [ ] View activity stats

**Reports:**
- [ ] Report review queue
- [ ] Action reports (dismiss, warn, ban)

**Analytics Dashboard:**
- [ ] DAU/MAU
- [ ] Matches per day
- [ ] Messages per day
- [ ] Conversion metrics

**Subscriptions:**
- [ ] Active subscription list
- [ ] Revenue reporting

### Landing App Features

**Marketing Pages:**
- [ ] Hero section with app screenshots
- [ ] Features page (voice intros, compatibility, anti-ghosting)
- [ ] Pricing page
- [ ] FAQ
- [ ] "Add to Home Screen" instructions

**Trust Signals:**
- [ ] Testimonials
- [ ] Safety features highlight
- [ ] Privacy policy / Terms of service

---

## Build Order (12-Week Timeline)

### Weeks 1-2: Foundation
**Setup:**
1. Initialize Turborepo
2. Create all 3 apps
3. Set up database package
4. Install shadcn/ui in all apps
5. Configure Supabase client

**Database:**
1. Run schema migration (dating-app-schema.sql)
2. Generate TypeScript types
3. Test RLS policies

### Weeks 3-4: Web App Auth & Onboarding
1. Build auth flow (signup, login, logout)
2. Phone verification integration
3. Multi-step onboarding form
4. Photo upload with preview
5. Voice intro recording
6. Location capture

### Weeks 5-6: Discovery & Matching
1. Discovery feed API integration
2. Swipe card component (Framer Motion)
3. Swipe deck container
4. Like/pass/super like actions
5. Daily swipe limit enforcement
6. Match detection + celebration screen

### Weeks 7-8: Chat
1. Match list page
2. Conversation view
3. Real-time messaging (Supabase Realtime)
4. Typing indicators
5. Unmatch functionality

### Weeks 9-10: Premium & Safety
1. Stripe integration
2. Premium feature gates
3. Report/block functionality
4. Photo moderation pipeline
5. Settings pages

### Weeks 11: Admin Panel
1. Admin auth
2. Photo moderation queue
3. Voice moderation queue
4. Report review queue
5. User search and management
6. Basic analytics dashboard

### Week 12: Landing Page & Polish
1. Landing page hero
2. Features page
3. Pricing page
4. FAQ
5. PWA instructions
6. Final testing and optimization

---

## Key Implementation Patterns

### 1. Using Shared Database Package

**In any app:**
```typescript
// Import from shared package
import { supabase, getProfile, updateProfile } from '@dating-app/database'

// Use the API functions
const profile = await getProfile(userId)
await updateProfile(userId, { bio: 'Updated bio' })
```

### 2. Swipe Deck Component

**apps/web/src/components/discover/SwipeDeck.tsx:**
```typescript
'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'
import { createSwipe } from '@dating-app/database'

interface Profile {
  id: string
  name: string
  age: number
  photos: string[]
  bio: string
}

export function SwipeDeck({ profiles }: { profiles: Profile[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = async (event: any, info: any) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (Math.abs(offset) > 150 || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 'like' : 'pass'
      
      // Create swipe in database
      await createSwipe({
        swiper_id: currentUserId,
        swiped_id: profiles[currentIndex].id,
        direction
      })

      // Move to next card
      setCurrentIndex(prev => prev + 1)
    }
  }

  if (currentIndex >= profiles.length) {
    return <div>No more profiles</div>
  }

  const currentProfile = profiles[currentIndex]

  return (
    <motion.div
      className="relative w-full h-[600px]"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
    >
      {/* Card content */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <img src={currentProfile.photos[0]} alt={currentProfile.name} />
        <div className="p-6">
          <h2 className="text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
          <p className="mt-2 text-gray-600">{currentProfile.bio}</p>
        </div>
      </div>
    </motion.div>
  )
}
```

### 3. Real-Time Chat

**apps/web/src/components/chat/ChatView.tsx:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase, Message } from '@dating-app/database'

export function ChatView({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      
      setMessages(data || [])
    }

    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <div key={msg.id} className="mb-4">
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 4. Photo Upload with Moderation

**packages/database/src/api/photos.ts:**
```typescript
import { supabase } from '../client'
import { moderatePhoto } from '../services/moderation'

export const uploadPhoto = async (
  profileId: string,
  file: File,
  displayOrder: number
) => {
  // Upload to Supabase Storage
  const fileName = `${profileId}/${Date.now()}-${file.name}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file)
  
  if (uploadError) throw uploadError
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(fileName)
  
  // Run AWS Rekognition moderation
  const moderationResult = await moderatePhoto(publicUrl)
  
  // Insert photo record
  const { data, error } = await supabase
    .from('photos')
    .insert({
      profile_id: profileId,
      url: publicUrl,
      storage_path: fileName,
      display_order: displayOrder,
      moderation_status: moderationResult.isApproved ? 'approved' : 'pending',
      moderation_labels: moderationResult.labels
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

---

## Mobile-First Design Guidelines

### Tailwind Breakpoints
```javascript
// tailwind.config.js (all apps)
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '375px',   // iPhone SE
        'sm': '640px',   // Large phones
        'md': '768px',   // Tablets
        'lg': '1024px',  // Desktop
      }
    }
  }
}
```

### Touch Targets
- Minimum 44x44px for all interactive elements
- Swipe cards should be full-screen on mobile
- Bottom navigation fixed with safe-area-inset-bottom

### Key UI Patterns

**Bottom Navigation (Web App):**
```typescript
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t pb-safe">
  <div className="flex justify-around py-2">
    <NavButton icon="heart" label="Discover" />
    <NavButton icon="message-circle" label="Matches" />
    <NavButton icon="user" label="Profile" />
  </div>
</nav>
```

**Swipe Cards:**
- Full viewport height on mobile
- Max-width 600px on desktop
- Touch-optimized drag area

**Chat:**
- Full screen on mobile
- Fixed header with back button
- Input fixed to bottom with keyboard handling

---

## PWA Installation Instructions (For Landing Page)

**iOS:**
1. Open Safari
2. Tap the Share button
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

**Android:**
1. Open Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"
4. Tap "Add"

**Include screenshots of these steps on landing page.**

---

## Deployment Strategy

### Vercel Deployment (All 3 Apps)

**Web App:**
- Deploy from `apps/web`
- Domain: `app.yourdomain.com`
- Environment: All shared env vars

**Admin App:**
- Deploy from `apps/admin`
- Domain: `admin.yourdomain.com`
- Environment: All shared env vars

**Landing App:**
- Deploy from `apps/landing`
- Domain: `yourdomain.com`
- Environment: Public URLs only

**Vercel Configuration:**

Each app needs a `vercel.json`:
```json
{
  "buildCommand": "cd ../.. && pnpm run build --filter=web",
  "outputDirectory": ".next",
  "installCommand": "pnpm install"
}
```

---

## Path to Native Apps (Future)

### Adding Capacitor (1-2 Weeks)

1. Install Capacitor in web app:
```bash
cd apps/web
npm install @capacitor/core @capacitor/cli
npx cap init
```

2. Add platforms:
```bash
npx cap add ios
npx cap add android
```

3. Build and sync:
```bash
pnpm build
npx cap sync
```

4. Open in Xcode/Android Studio:
```bash
npx cap open ios
npx cap open android
```

**What stays the same:**
- All code in `apps/web`
- All shared database logic
- All API calls

**What changes:**
- Capacitor wraps the web app
- Native plugins for camera, push notifications
- Build for app stores

---

## Development Workflow

### Starting All Apps

```bash
# Root directory
pnpm install
pnpm dev
```

This starts:
- Web app on http://localhost:3000
- Admin app on http://localhost:3001
- Landing app on http://localhost:3002

### Working on a Single App

```bash
# Only web app
cd apps/web
pnpm dev

# Only admin
cd apps/admin
pnpm dev
```

### Building for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build --filter=web
```

---

## Testing Strategy

### Unit Tests (packages/database)
- Pure utility functions
- Business logic in services/
- Distance calculations, age validation, etc.

### Integration Tests
- API wrappers in api/
- Supabase queries
- Moderation pipelines

### E2E Tests (Future)
- Critical user flows
- Auth → Onboarding → Discovery → Match → Chat
- Premium upgrade flow

---

## Security Checklist

- [x] Row Level Security on all Supabase tables
- [x] Phone verification required
- [x] Photo moderation before going live
- [x] Rate limiting on swipes
- [x] HTTPS only (enforced by Vercel)
- [x] Environment variables never exposed to client
- [x] Content Security Policy headers
- [x] Input sanitization on all forms
- [x] JWT tokens with refresh mechanism

---

## Cost Estimates

### MVP Phase (Months 1-3)
- Vercel Pro (3 apps): $60/month ($20 each)
- Supabase Pro: $25/month
- Twilio (500 verifications): $25/month
- AWS Rekognition: ~$10/month
- Stripe: 2.9% + $0.30 per transaction
- **Total: ~$120/month + transaction fees**

### Growth Phase (5,000 users)
- Vercel: $60/month
- Supabase Pro + Storage: $60/month
- Twilio: $250/month
- AWS Rekognition: $25/month
- **Total: ~$395/month**

Revenue at 5% conversion (250 paid users × $12.99) = $3,247/month
Infrastructure costs = 12% of revenue ✅

---

## Post-MVP Features (Phase 2)

**Not in initial 12 weeks:**
- Compatibility quiz (weeks 13-15)
- Smart visibility algorithm (weeks 16-18)
- "Interested in You" queue (week 19)
- Anti-ghosting penalties (week 20)
- Referral system (weeks 21-22)
- Read receipts (week 23)
- Undo swipe (week 23)
- Photo sharing in chat (week 24)
- GIFs in chat (week 24)
- Advanced admin analytics (weeks 25-26)

---

## Critical Reminders

1. **Database package is the source of truth** — All Supabase logic lives here
2. **Mobile-first always** — Design for 375px width first
3. **PWA before native** — Ship fast, add Capacitor later
4. **Security via RLS** — Never bypass Row Level Security
5. **Type everything** — Use generated Supabase types
6. **Real-time is critical** — Chat must feel instant
7. **Optimize images** — Lazy load, compress uploads, use WebP
8. **Test on real devices** — Chrome DevTools isn't enough

---

## Getting Started

**First steps for Claude Code:**

1. Create Turborepo structure
2. Set up all 3 apps (web, admin, landing)
3. Create database package
4. Install dependencies in all apps
5. Configure Supabase client
6. Generate database types from schema
7. Start with web app auth flow

**Database already created** — Use the `dating-app-schema.sql` file that's already been run in Supabase.

Good luck! 🚀