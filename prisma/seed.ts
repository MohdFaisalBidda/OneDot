import prisma from '@/lib/prismaClient';
import { hash } from 'bcryptjs';
import { randomInt } from 'crypto';


// Define enums as they are in your Prisma schema
const FocusStatus = {
  PENDING: 'PENDING',
  ACHIEVED: 'ACHIEVED',
  NOT_ACHIEVED: 'NOT_ACHIEVED',
  PARTIALLY_ACHIEVED: 'PARTIALLY_ACHIEVED'
} as const;

const DecisionStatus = {
  PENDING: 'PENDING',
  ACHIEVED: 'ACHIEVED',
  NOT_ACHIEVED: 'NOT_ACHIEVED',
  PARTIALLY_ACHIEVED: 'PARTIALLY_ACHIEVED'
} as const;

const DecisionCategory = {
  CAREER: 'CAREER',
  HEALTH: 'HEALTH',
  FINANCE: 'FINANCE',
  RELATIONSHIPS: 'RELATIONSHIPS',
  LIFESTYLE: 'LIFESTYLE',
  GENERAL: 'GENERAL',
  OTHER: 'OTHER'
} as const;

// Helper function to get random enum value
function getRandomEnumValue<T extends object>(enumObj: T): T[keyof T] {
  const values = Object.values(enumObj) as T[keyof T][];
  return values[Math.floor(Math.random() * values.length)];
}

type User = {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  bio: string | null;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
};

// Sample data
const FOCUS_TITLES = [
  'Complete project proposal',
  'Morning workout session',
  'Team meeting preparation',
  'Code review',
  'Learn new technology',
  'Client presentation',
  'Write documentation',
  'Fix critical bugs',
  'Plan next sprint',
  'Read industry news',
];

const FOCUS_NOTES = [
  'Need to finish this by EOD',
  'Focus on the most important tasks first',
  'Take notes during the session',
  'Review all edge cases',
  'Make sure to test thoroughly',
  'Prepare slides and demo',
  'Keep it simple and clear',
  'Check for performance issues',
  'Prioritize tasks effectively',
  'Stay updated with latest trends',
];

const DECISION_TITLES = [
  'Adopt new framework',
  'Hire new team member',
  'Change project direction',
  'Invest in new tools',
  'Restructure team',
  'Pivot product strategy',
  'Change pricing model',
  'Expand to new market',
  'Outsource development',
  'Implement new feature',
];

const DECISION_REASONS = [
  'Improve development speed',
  'Team is overloaded',
  'Current approach not working',
  'Increase productivity',
  'Better collaboration',
  'Market demand has changed',
  'Increase revenue',
  'New opportunities',
  'Lack of expertise in-house',
  'User feedback',
];

const MOODS = ['happy', 'neutral', 'sad', 'excited', 'tired', 'focused', 'stressed', 'calm'];

async function createTestUser(): Promise<User> {
  const hashedPassword = await hash('password123', 12);
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'faisal@demo.com' },
  });

  if (existingUser) {
    // Delete existing data
    await prisma.focus.deleteMany({ where: { userId: existingUser.id } });
    await prisma.decision.deleteMany({ where: { userId: existingUser.id } });
    return existingUser;
  }

  // Create new user if doesn't exist
  return prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      bio: 'A test user for development purposes',
    },
  });
}

function getRandomDateInRange(startDate: Date, endDate: Date): Date {
  // Get a random time between the two dates
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  const randomDate = new Date(randomTime);
  
  // Set random time during the day
  randomDate.setHours(randomInt(9, 20), randomInt(0, 59), randomInt(0, 59));
  
  return randomDate;
}

function getRandomDateInCurrentMonth(): Date {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return getRandomDateInRange(startOfMonth, endOfMonth);
}

function getRandomDateInPastYear(): Date {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  
  return getRandomDateInRange(oneYearAgo, now);
}

// Generate random dates for November 2023
function getRandomNovemberDate(): Date {
  const startDate = new Date(2023, 10, 1); // November 1, 2023 (months are 0-indexed)
  const endDate = new Date(2023, 10, 30);  // November 30, 2023
  
  // Get a random time between November 1 and November 30, 2023
  return getRandomDateInRange(startDate, endDate);
}

async function createFocusEntries(userId: string, count: number) {
  // Create a more realistic distribution of statuses
  const statusWeights = {
    [FocusStatus.PENDING]: 0.2,
    [FocusStatus.ACHIEVED]: 0.6,
    [FocusStatus.PARTIALLY_ACHIEVED]: 0.15,
    [FocusStatus.NOT_ACHIEVED]: 0.05
  };

  for (let i = 0; i < count; i++) {
    // Use weighted random for status
    const random = Math.random();
    let cumulativeWeight = 0;
    let randomStatus = FocusStatus.PENDING;
    
    for (const [status, weight] of Object.entries(statusWeights)) {
      cumulativeWeight += weight as number;
      if (random < cumulativeWeight) {
        randomStatus = status as any; // Using any to bypass the type error
        break;
      }
    }
    const randomTitle = FOCUS_TITLES[Math.floor(Math.random() * FOCUS_TITLES.length)];
    const randomNote = FOCUS_NOTES[Math.floor(Math.random() * FOCUS_NOTES.length)];
    const randomMood = MOODS[Math.floor(Math.random() * MOODS.length)];
    // Use weighted random date distribution
    const randomDate = getRandomNovemberDate();
    
    await prisma.focus.create({
      data: {
        title: randomTitle,
        status: randomStatus,
        mood: randomMood,
        notes: randomNote,
        createdAt: randomDate,
        userId,
      },
    });
  }
}

async function createDecisionEntries(userId: string, count: number) {
  // Create a more realistic distribution of statuses and categories
  const statusWeights = {
    [DecisionStatus.PENDING]: 0.15,
    [DecisionStatus.ACHIEVED]: 0.7,
    [DecisionStatus.PARTIALLY_ACHIEVED]: 0.1,
    [DecisionStatus.NOT_ACHIEVED]: 0.05
  };

  const categoryWeights = {
    [DecisionCategory.CAREER]: 0.3,
    [DecisionCategory.HEALTH]: 0.2,
    [DecisionCategory.FINANCE]: 0.15,
    [DecisionCategory.RELATIONSHIPS]: 0.15,
    [DecisionCategory.LIFESTYLE]: 0.1,
    [DecisionCategory.GENERAL]: 0.05,
    [DecisionCategory.OTHER]: 0.05
  };

  for (let i = 0; i < count; i++) {
    // Use weighted random for status
    let random = Math.random();
    let cumulativeWeight = 0;
    let randomStatus = DecisionStatus.PENDING;
    
    for (const [status, weight] of Object.entries(statusWeights)) {
      cumulativeWeight += weight as number;
      if (random < cumulativeWeight) {
        randomStatus = status as any; // Using any to bypass the type error
        break;
      }
    }
    
    // Use weighted random for category
    random = Math.random();
    cumulativeWeight = 0;
    let randomCategory = DecisionCategory.GENERAL;
    
    for (const [category, weight] of Object.entries(categoryWeights)) {
      cumulativeWeight += weight as number;
      if (random < cumulativeWeight) {
        randomCategory = category as any; // Using any to bypass the type error
        break;
      }
    }
    const randomTitle = DECISION_TITLES[Math.floor(Math.random() * DECISION_TITLES.length)];
    const randomReason = DECISION_REASONS[Math.floor(Math.random() * DECISION_REASONS.length)];
    // Use weighted random date distribution
    const randomDate = getRandomNovemberDate();
    
    await prisma.decision.create({
      data: {
        title: randomTitle,
        reason: randomReason,
        status: randomStatus,
        category: randomCategory,
        createdAt: randomDate,
        userId,
      },
    });
  }
}

async function main() {
  console.log('🌱 Starting seed...');
  
  // Create test user
  const user = await createTestUser();
  console.log(`👤 Test user ready: ${user.email}`);
  
  // Create focus entries
  const focusCount = 15; // Number of focus entries to create
  await createFocusEntries(user.id, focusCount);
  console.log(`✅ Created ${focusCount} focus entries`);
  
  // Create decision entries
  const decisionCount = 10; // Number of decision entries to create
  await createDecisionEntries(user.id, decisionCount);
  console.log(`✅ Created ${decisionCount} decision entries`);
  
  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
