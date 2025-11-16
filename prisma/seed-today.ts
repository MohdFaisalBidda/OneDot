import prisma from '@/lib/prismaClient';
import { hash } from 'bcryptjs';

// Sample data for today's entries
const TODAY = new Date();

// Helper function to set time to start of today
function startOfToday() {
  const today = new Date(TODAY);
  today.setHours(0, 0, 0, 0);
  return today;
}

// Types matching Prisma enums
type FocusStatus = 'PENDING' | 'ACHIEVED' | 'NOT_ACHIEVED' | 'PARTIALLY_ACHIEVED';
type DecisionStatus = 'PENDING' | 'ACHIEVED' | 'NOT_ACHIEVED' | 'PARTIALLY_ACHIEVED';
type DecisionCategory = 'CAREER' | 'HEALTH' | 'FINANCE' | 'RELATIONSHIPS' | 'LIFESTYLE' | 'GENERAL' | 'OTHER';

// Sample focus entries for today
const TODAYS_FOCUS_ENTRIES: Array<{
  title: string;
  status: FocusStatus;
  mood: string;
  notes: string;
  image: string | null;
}> = [
  {
    title: 'Complete project presentation',
    status: 'PENDING',
    mood: 'Energetic',
    notes: 'Need to finalize the slides and practice the demo',
    image: null
  },
  {
    title: 'Team sync meeting',
    status: 'ACHIEVED',
    mood: 'Focused',
    notes: 'Discuss progress and blockers with the team',
    image: null
  },
  {
    title: 'Code review',
    status: 'PENDING',
    mood: 'Determined',
    notes: 'Review PRs and provide feedback',
    image: null
  }
];

// Sample decision entries for today
const TODAYS_DECISION_ENTRIES: Array<{
  title: string;
  reason: string;
  status: DecisionStatus;
  category: DecisionCategory;
  image: string | null;
}> = [
  {
    title: 'Choose tech stack for new project',
    reason: 'Need to decide between Next.js and Remix for the frontend',
    status: 'PENDING',
    category: 'CAREER',
    image: null
  },
  {
    title: 'Plan team building activity',
    reason: 'Boost team morale and collaboration',
    status: 'PENDING',
    category: 'RELATIONSHIPS',
    image: null
  }
];

async function createTestUser() {
  const hashedPassword = await hash('password123', 12);
  
  return prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      bio: 'A test user for development',
      theme: 'LIGHT',
    },
  });
}

async function getTestUser() {
  return prisma.user.findUnique({
    where: { email: 'faisal@demo.com' },
  });
}

async function createTodaysEntries() {
  console.log('🌱 Seeding database with today\'s entries...');
  
  // Create test user if not exists
  const user = await getTestUser();
  if (!user) {
    console.log('❌ Test user not found');
    return;
  }
  console.log(`✅ Created test user: ${user.email}`);
  
  // Create today's focus entries
  const focusPromises = TODAYS_FOCUS_ENTRIES.map(focus => 
    prisma.focus.create({
      data: {
        ...focus,
        date: startOfToday(),
        userId: user.id,
      },
    })
  );
  
  // Create today's decision entries
  const decisionPromises = TODAYS_DECISION_ENTRIES.map(decision =>
    prisma.decision.create({
      data: {
        ...decision,
        date: startOfToday(),
        userId: user.id,
      },
    })
  );
  
  const [focusEntries, decisionEntries] = await Promise.all([
    Promise.all(focusPromises),
    Promise.all(decisionPromises)
  ]);
  
  console.log(`✅ Created ${focusEntries.length} focus entries`);
  console.log(`✅ Created ${decisionEntries.length} decision entries`);
  
  return { user, focusEntries, decisionEntries };
}

createTodaysEntries()
  .then(() => {
    console.log('🌱 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  });
