const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const { randomInt } = require('crypto');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Define enums as they are in your Prisma schema
const FocusStatus = {
  PENDING: 'PENDING',
  ACHIEVED: 'ACHIEVED',
  NOT_ACHIEVED: 'NOT_ACHIEVED',
  PARTIALLY_ACHIEVED: 'PARTIALLY_ACHIEVED'
};

const DecisionStatus = {
  PENDING: 'PENDING',
  ACHIEVED: 'ACHIEVED',
  NOT_ACHIEVED: 'NOT_ACHIEVED',
  PARTIALLY_ACHIEVED: 'PARTIALLY_ACHIEVED'
};

const DecisionCategory = {
  CAREER: 'CAREER',
  HEALTH: 'HEALTH',
  FINANCE: 'FINANCE',
  RELATIONSHIPS: 'RELATIONSHIPS',
  LIFESTYLE: 'LIFESTYLE',
  GENERAL: 'GENERAL',
  OTHER: 'OTHER'
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

function getRandomDateInCurrentMonth() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Random date between start and end of month
  const randomTime = startOfMonth.getTime() + Math.random() * (endOfMonth.getTime() - startOfMonth.getTime());
  const randomDate = new Date(randomTime);
  
  // Set random time during the day
  randomDate.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  
  return randomDate;
}

function getRandomEnumValue(enumObj) {
  const values = Object.values(enumObj);
  return values[Math.floor(Math.random() * values.length)];
}

async function createTestUser() {
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
      email: 'faisal@demo.com',
      name: 'Test User',
      password: hashedPassword,
      bio: 'A test user for development purposes',
    },
  });
}

async function createFocusEntries(userId, count) {
  for (let i = 0; i < count; i++) {
    const randomStatus = getRandomEnumValue(FocusStatus);
    const randomTitle = FOCUS_TITLES[Math.floor(Math.random() * FOCUS_TITLES.length)];
    const randomNote = FOCUS_NOTES[Math.floor(Math.random() * FOCUS_NOTES.length)];
    const randomMood = MOODS[Math.floor(Math.random() * MOODS.length)];
    const randomDate = getRandomDateInCurrentMonth();
    
    await prisma.focus.create({
      data: {
        title: randomTitle,
        status: randomStatus,
        mood: randomMood,
        notes: randomNote,
        date: randomDate,
        userId,
      },
    });
  }
}

async function createDecisionEntries(userId, count) {
  for (let i = 0; i < count; i++) {
    const randomStatus = getRandomEnumValue(DecisionStatus);
    const randomCategory = getRandomEnumValue(DecisionCategory);
    const randomTitle = DECISION_TITLES[Math.floor(Math.random() * DECISION_TITLES.length)];
    const randomReason = DECISION_REASONS[Math.floor(Math.random() * DECISION_REASONS.length)];
    const randomDate = getRandomDateInCurrentMonth();
    
    await prisma.decision.create({
      data: {
        title: randomTitle,
        reason: randomReason,
        status: randomStatus,
        category: randomCategory,
        date: randomDate,
        userId,
      },
    });
  }
}

async function main() {
  console.log('🌱 Starting seed...');
  
  try {
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
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
