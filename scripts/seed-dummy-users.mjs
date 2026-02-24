/**
 * Seed dummy users for Ring Bearer testing.
 * Run from repo root: node scripts/seed-dummy-users.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env
const envPath = resolve(__dirname, '../.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
    .filter(([k]) => k)
)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Dummy user data — diverse mix for realistic testing
const DUMMY_USERS = [
  {
    email: 'sophia.chen@test.ringbearer.com',
    name: 'Sophia',
    birthdate: '1996-03-14',
    gender: 'woman',
    seeking_gender: 'men',
    bio: "Software engineer by day, amateur chef by night. I make a killer ramen from scratch and I'm always down to try new restaurants. Looking for someone who appreciates both deep conversations and silly humor. Big fan of hiking, Studio Ghibli films, and anything matcha.",
    location_name: 'San Francisco, CA',
    photos: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80',
    ],
  },
  {
    email: 'marcus.johnson@test.ringbearer.com',
    name: 'Marcus',
    birthdate: '1993-07-22',
    gender: 'man',
    seeking_gender: 'women',
    bio: "Middle school history teacher who coaches JV basketball on the side. I believe good food, good music, and good people are all you need in life. Huge jazz nerd — seen Miles Davis tributes in 3 countries. Travel is my love language.",
    location_name: 'Atlanta, GA',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    ],
  },
  {
    email: 'elena.vasquez@test.ringbearer.com',
    name: 'Elena',
    birthdate: '1998-11-05',
    gender: 'woman',
    seeking_gender: 'everyone',
    bio: "Graphic designer and part-time roller derby queen 🛼. My apartment has more plants than furniture, which my cat Mochi approves of. I love early mornings, farmers markets, and people who can recommend a good book. Probably too enthusiastic about true crime podcasts.",
    location_name: 'Austin, TX',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&q=80',
    ],
  },
  {
    email: 'james.okafor@test.ringbearer.com',
    name: 'James',
    birthdate: '1991-04-18',
    gender: 'man',
    seeking_gender: 'men',
    bio: "ER nurse with a dark sense of humor (occupational hazard). When I'm off the clock I'm either at the climbing gym, perfecting my sourdough, or rewatching The Wire. I'm a good listener, an even better cook, and I will absolutely judge you if you don't tip well.",
    location_name: 'Chicago, IL',
    photos: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80',
    ],
  },
  {
    email: 'priya.patel@test.ringbearer.com',
    name: 'Priya',
    birthdate: '1995-09-30',
    gender: 'woman',
    seeking_gender: 'men',
    bio: "PhD student in computational biology, professional overthinker, and surprisingly good at karaoke. I grew up between Mumbai and Toronto so I'm fluent in three languages and Bollywood references. Looking for someone to explore the city with, debate movies, and maybe adopt a dog someday.",
    location_name: 'Boston, MA',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    ],
  },
  {
    email: 'tyler.brooks@test.ringbearer.com',
    name: 'Tyler',
    birthdate: '1994-02-08',
    gender: 'man',
    seeking_gender: 'women',
    bio: "Landscape architect who spends weekends camping or at the farmers market. I'm the person who slows down to look at every dog on the street. Currently learning Spanish and terrible at it. Love live music, dive bars, and people who have opinions about coffee.",
    location_name: 'Denver, CO',
    photos: [
      'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=400&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    ],
  },
  {
    email: 'aisha.williams@test.ringbearer.com',
    name: 'Aisha',
    birthdate: '1997-06-12',
    gender: 'woman',
    seeking_gender: 'men',
    bio: "Marketing manager at a tech startup, amateur painter, and self-described brunch evangelist. I make my bed every morning and have an embarrassingly large candle collection. Searching for someone who can keep up on a hike and slow down over a long dinner.",
    location_name: 'New York, NY',
    photos: [
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
      'https://images.unsplash.com/photo-1535324492437-d8dea70a38a7?w=400&q=80',
    ],
  },
  {
    email: 'noah.kim@test.ringbearer.com',
    name: 'Noah',
    birthdate: '1992-12-25',
    gender: 'man',
    seeking_gender: 'women',
    bio: "Film director working on my second short. Craft beer enthusiast (I'll convert you). I've read Infinite Jest twice which tells you everything about me. Love exploring neighborhoods, vintage record stores, and people who aren't afraid to be a little weird.",
    location_name: 'Los Angeles, CA',
    photos: [
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    ],
  },
  {
    email: 'camille.dubois@test.ringbearer.com',
    name: 'Camille',
    birthdate: '1999-08-03',
    gender: 'woman',
    seeking_gender: 'everyone',
    bio: "Yoga instructor and part-time freelance photographer. Grew up in Montreal so I switch between English and French without noticing. Passionate about sustainability, live music, and finding the perfect croissant. Looking for genuine connections, not pen pals.",
    location_name: 'Seattle, WA',
    photos: [
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80',
    ],
  },
  {
    email: 'daniel.nguyen@test.ringbearer.com',
    name: 'Daniel',
    birthdate: '1990-05-17',
    gender: 'man',
    seeking_gender: 'women',
    bio: "Civil engineer by trade, home barista by passion. I'm the friend who shows up 10 minutes early to everything and has too many opinions about fonts. Currently training for my first marathon, slowly. Would love to find someone to explore new restaurants and argue about movies with.",
    location_name: 'Houston, TX',
    photos: [
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&q=80',
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&q=80',
    ],
  },
]

async function seedUsers() {
  console.log('🌱 Seeding dummy users...\n')

  for (const user of DUMMY_USERS) {
    process.stdout.write(`  Creating ${user.name} (${user.email})... `)

    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'TestPassword123!',
      email_confirm: true,
    })

    if (authErr) {
      if (authErr.message.includes('already been registered')) {
        console.log('⚠️  already exists, skipping')
        continue
      }
      console.log(`❌ auth error: ${authErr.message}`)
      continue
    }

    const userId = authData.user.id

    // Wait briefly for DB trigger to create profile row
    await new Promise(r => setTimeout(r, 500))

    // Upsert profile data
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        name: user.name,
        birthdate: user.birthdate,
        gender: user.gender,
        seeking_gender: user.seeking_gender,
        bio: user.bio,
        location_name: user.location_name,
        min_age: 21,
        max_age: 40,
        is_active: true,
        is_banned: false,
        profile_completed: true,
        last_active_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'user_id' })
      .select('id')
      .single()

    if (profileErr || !profileData) {
      console.log(`❌ profile error: ${profileErr?.message}`)
      continue
    }

    const profileId = profileData.id

    // Insert photos
    for (let i = 0; i < user.photos.length; i++) {
      await supabase.from('photos').insert({
        profile_id: profileId,
        url: user.photos[i],
        storage_path: `seed/${profileId}/${i}.jpg`,
        display_order: i,
        moderation_status: 'approved',
      })
    }

    console.log(`✅ done (profile: ${profileId})`)
  }

  console.log('\n✨ Seeding complete!')
  console.log('\nAll test accounts use password: TestPassword123!')
  console.log('Emails follow the pattern: firstname.lastname@test.ringbearer.com\n')
}

seedUsers().catch(console.error)
